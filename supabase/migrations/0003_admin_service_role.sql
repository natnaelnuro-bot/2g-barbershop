grant usage on schema public to service_role;
grant select on table appointments, customers, services, barbers to service_role;
grant update (status, updated_at) on table appointments to service_role;
