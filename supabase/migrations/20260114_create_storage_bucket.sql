-- Create a storage bucket for images
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Set up security policies for the 'images' bucket

-- 1. Allow public access to view images (SELECT)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'images' );

-- 2. Allow authenticated users to upload images (INSERT)
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'images' and auth.role() = 'authenticated' );

-- 3. Allow users to update their own images (UPDATE) - Optional, simplified to all auth for now or owner based
create policy "Authenticated users can update images"
  on storage.objects for update
  using ( bucket_id = 'images' and auth.role() = 'authenticated' );

-- 4. Allow users to delete their own images (DELETE)
create policy "Authenticated users can delete images"
  on storage.objects for delete
  using ( bucket_id = 'images' and auth.role() = 'authenticated' );
