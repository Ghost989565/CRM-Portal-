-- Create storage bucket for client presentation and document uploads
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

-- Allow users to view only their own files in this bucket
drop policy if exists "client_files_storage_select_own" on storage.objects;
create policy "client_files_storage_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload only into their own folder prefix
drop policy if exists "client_files_storage_insert_own" on storage.objects;
create policy "client_files_storage_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update only their own files
drop policy if exists "client_files_storage_update_own" on storage.objects;
create policy "client_files_storage_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete only their own files
drop policy if exists "client_files_storage_delete_own" on storage.objects;
create policy "client_files_storage_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);
