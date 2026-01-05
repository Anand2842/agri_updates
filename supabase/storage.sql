-- Create a public bucket for images
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up access policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

create policy "Authenticated Permissive Upload"
  on storage.objects for insert
  with check ( bucket_id = 'images' );

create policy "Authenticated Permissive Update"
  on storage.objects for update
  using ( bucket_id = 'images' );
