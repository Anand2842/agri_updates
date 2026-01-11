-- Create a table for Comments
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  parent_id uuid references comments(id) on delete cascade,
  user_name text not null,
  content text not null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table comments enable row level security;

-- Policies (Public Read, Public Write for now as requested "User can comment")
create policy "Public comments are viewable by everyone."
  on comments for select
  using ( true );

create policy "Anyone can insert a comment."
  on comments for insert
  with check ( true );

create policy "Anyone can update likes (simplified)."
  on comments for update
  using ( true );
