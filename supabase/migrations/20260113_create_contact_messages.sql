create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  resolved boolean default false
);

alter table contact_messages enable row level security;

-- Allow anyone (anon) to insert messages
create policy "Allow public to insert contact messages"
on contact_messages for insert
to public
with check (true);

-- Allow only service_role (and potentially specific admins) to view
-- For now, restricting to service_role to prevent public reading
create policy "Allow service_role to view contact messages"
on contact_messages for select
to service_role
using (true);
