-- Create authors table
create table if not exists authors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  bio text,
  role text default 'Contributor', -- Senior Editor, Analyst, etc.
  avatar_url text,
  social_links jsonb default '{}'::jsonb, -- e.g. {"linkedin": "url", "twitter": "url"}
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table authors enable row level security;

-- Policies
create policy "Public authors are viewable by everyone"
  on authors for select
  using ( is_active = true );

create policy "Admins can insert authors"
  on authors for insert
  to authenticated
  with check ( true );

create policy "Admins can update authors"
  on authors for update
  to authenticated
  using ( true );

create policy "Admins can delete authors"
  on authors for delete
  to authenticated
  using ( true );

-- Seed default author
insert into authors (name, bio, role, avatar_url)
values (
  'Agri Updates Editor', 
  'Dedicated to bringing you the latest in agricultural news and innovation.', 
  'Editor-in-Chief',
  'https://ui-avatars.com/api/?name=Agri+Updates&background=10b981&color=fff'
);
