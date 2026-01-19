-- Create ads table
create table if not exists ads (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  link_url text not null,
  placement text not null default 'banner', -- 'banner', 'sidebar', etc.
  is_active boolean default true,
  start_date timestamptz,
  end_date timestamptz,
  views integer default 0,
  clicks integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table ads enable row level security;

-- Policies
create policy "Public ads are viewable by everyone"
  on ads for select
  using (is_active = true);

create policy "Admins can insert ads"
  on ads for insert
  with check (auth.role() = 'service_role' or auth.uid() in (
    select id from authors where role in ('admin', 'moderator')
  ));

create policy "Admins can update ads"
  on ads for update
  using (auth.role() = 'service_role' or auth.uid() in (
    select id from authors where role in ('admin', 'moderator')
  ));

create policy "Admins can delete ads"
  on ads for delete
  using (auth.role() = 'service_role' or auth.uid() in (
    select id from authors where role in ('admin', 'moderator')
  ));

-- Grant access
grant select on ads to anon, authenticated;
grant all on ads to service_role;
