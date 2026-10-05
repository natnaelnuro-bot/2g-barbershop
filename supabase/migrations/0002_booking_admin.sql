alter table customers add column if not exists email text;
alter table appointments add column if not exists updated_at timestamptz not null default now();

create or replace function available_slots(p_date date, p_service_slug text, p_barber_slug text default 'any')
returns table(slot_time text) language sql security definer set search_path = public as $$
  with service as (
    select duration_minutes from services where slug = p_service_slug and active
  ), slots as (
    select (p_date + time '09:00' + make_interval(mins => step * 30)) as local_start
    from generate_series(0, 21) as step
    where extract(isodow from p_date) < 7
  ), eligible as (
    select slots.local_start
    from slots cross join service s
    where slots.local_start + make_interval(mins => s.duration_minutes) <= p_date + time '20:00'
      and exists (
        select 1 from barbers b
        where b.active and (p_barber_slug = 'any' or b.slug = p_barber_slug)
          and not exists (
            select 1 from appointments a
            where a.barber_id = b.id and a.status not in ('cancelled', 'no_show')
              and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(
                slots.local_start at time zone 'Africa/Addis_Ababa',
                (slots.local_start + make_interval(mins => s.duration_minutes)) at time zone 'Africa/Addis_Ababa', '[)'
              )
          )
          and not exists (
            select 1 from barber_blocks bb
            where bb.barber_id = b.id and tstzrange(bb.starts_at, bb.ends_at, '[)') && tstzrange(
              slots.local_start at time zone 'Africa/Addis_Ababa',
              (slots.local_start + make_interval(mins => s.duration_minutes)) at time zone 'Africa/Addis_Ababa', '[)'
            )
          )
      )
  )
  select to_char(local_start, 'HH24:MI') from eligible order by local_start;
$$;

create or replace function create_appointment(
  p_service_slug text, p_barber_slug text, p_customer_name text, p_customer_phone text,
  p_customer_email text, p_notes text, p_start_at timestamptz, p_reference text
) returns uuid language plpgsql security definer set search_path = public as $$
declare s services; b barbers; c customers; appointment_id uuid; local_start timestamp;
begin
  select * into s from services where slug = p_service_slug and active;
  if not found then raise exception 'Service unavailable'; end if;
  local_start := p_start_at at time zone 'Africa/Addis_Ababa';
  if extract(isodow from local_start) = 7 or local_start::time < time '09:00'
    or local_start::time + make_interval(mins => s.duration_minutes) > time '20:00' then
    raise exception 'This time is outside our booking hours';
  end if;
  if p_barber_slug = 'any' then
    select b.* into b from barbers b where b.active and not exists(
      select 1 from appointments a where a.barber_id = b.id and a.status not in ('cancelled','no_show')
        and tstzrange(a.starts_at,a.ends_at,'[)') && tstzrange(p_start_at,p_start_at+make_interval(mins=>s.duration_minutes),'[)')
    ) and not exists(
      select 1 from barber_blocks bb where bb.barber_id = b.id
        and tstzrange(bb.starts_at,bb.ends_at,'[)') && tstzrange(p_start_at,p_start_at+make_interval(mins=>s.duration_minutes),'[)')
    ) order by b.created_at limit 1;
  else
    select b.* into b from barbers b where b.slug = p_barber_slug and b.active and not exists(
      select 1 from barber_blocks bb where bb.barber_id = b.id
        and tstzrange(bb.starts_at,bb.ends_at,'[)') && tstzrange(p_start_at,p_start_at+make_interval(mins=>s.duration_minutes),'[)')
    );
  end if;
  if not found then raise exception 'No barber available'; end if;
  insert into customers(full_name,phone,email) values(p_customer_name,p_customer_phone,nullif(p_customer_email,''))
    on conflict(phone) do update set full_name=excluded.full_name,email=coalesce(excluded.email,customers.email) returning * into c;
  insert into appointments(reference,customer_id,service_id,barber_id,starts_at,ends_at,notes)
    values(p_reference,c.id,s.id,b.id,p_start_at,p_start_at+make_interval(mins=>s.duration_minutes),nullif(p_notes,'')) returning id into appointment_id;
  return appointment_id;
end $$;
