create or replace function create_appointment(
  p_service_slug text, p_barber_slug text, p_customer_name text, p_customer_phone text,
  p_customer_email text, p_notes text, p_start_at timestamptz, p_reference text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  selected_service services;
  selected_barber barbers;
  selected_customer customers;
  appointment_id uuid;
  local_start timestamp;
begin
  select * into selected_service from services where slug = p_service_slug and active;
  if not found then raise exception 'Service unavailable'; end if;

  local_start := p_start_at at time zone 'Africa/Addis_Ababa';
  if extract(isodow from local_start) = 7 or local_start::time < time '09:00'
    or local_start::time + make_interval(mins => selected_service.duration_minutes) > time '20:00' then
    raise exception 'This time is outside our booking hours';
  end if;

  if p_barber_slug = 'any' then
    select barber_row.* into selected_barber
    from barbers as barber_row
    where barber_row.active
      and not exists (
        select 1 from appointments a
        where a.barber_id = barber_row.id and a.status not in ('cancelled', 'no_show')
          and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(
            p_start_at, p_start_at + make_interval(mins => selected_service.duration_minutes), '[)'
          )
      )
      and not exists (
        select 1 from barber_blocks bb
        where bb.barber_id = barber_row.id and tstzrange(bb.starts_at, bb.ends_at, '[)') && tstzrange(
          p_start_at, p_start_at + make_interval(mins => selected_service.duration_minutes), '[)'
        )
      )
    order by barber_row.created_at
    limit 1;
  else
    select barber_row.* into selected_barber
    from barbers as barber_row
    where barber_row.slug = p_barber_slug and barber_row.active
      and not exists (
        select 1 from appointments a
        where a.barber_id = barber_row.id and a.status not in ('cancelled', 'no_show')
          and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(
            p_start_at, p_start_at + make_interval(mins => selected_service.duration_minutes), '[)'
          )
      )
      and not exists (
        select 1 from barber_blocks bb
        where bb.barber_id = barber_row.id and tstzrange(bb.starts_at, bb.ends_at, '[)') && tstzrange(
          p_start_at, p_start_at + make_interval(mins => selected_service.duration_minutes), '[)'
        )
      );
  end if;
  if not found then raise exception 'No barber available'; end if;

  insert into customers(full_name, phone, email)
  values (p_customer_name, p_customer_phone, nullif(p_customer_email, ''))
  on conflict(phone) do update
    set full_name = excluded.full_name, email = coalesce(excluded.email, customers.email)
  returning * into selected_customer;

  insert into appointments(reference, customer_id, service_id, barber_id, starts_at, ends_at, notes)
  values (
    p_reference, selected_customer.id, selected_service.id, selected_barber.id,
    p_start_at, p_start_at + make_interval(mins => selected_service.duration_minutes), nullif(p_notes, '')
  ) returning id into appointment_id;

  return appointment_id;
end $$;

notify pgrst, 'reload schema';
