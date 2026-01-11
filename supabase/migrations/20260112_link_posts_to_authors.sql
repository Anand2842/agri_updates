-- Add author_id to posts table
alter table posts add column if not exists author_id uuid references authors(id) on delete set null;

-- Update existing posts to link to the first available author (Migration Strategy)
-- This ensures invalidating the 'author_name' string column later won't break things immediately
do $$
declare
  default_author_id uuid;
begin
  select id into default_author_id from authors limit 1;
  
  if default_author_id is not null then
    update posts set author_id = default_author_id where author_id is null;
  end if;
end $$;
