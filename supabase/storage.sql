-- Create a bucket named `media` in Supabase Storage first.
create policy "authenticated upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media');
-- Enable public read only if the bucket is intentionally public.
create policy "public read media" on storage.objects for select to public using (bucket_id = 'media');
