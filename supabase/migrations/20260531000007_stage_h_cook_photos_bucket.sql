-- Stage H — Supabase Storage for user cook photos (docs/MVP-FEATURE-PLAN.md).
-- food_images/* stay static bundled assets; Storage is only for
-- user-generated cook photos. Public bucket, 5 MB, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cook-photos', 'cook-photos', true, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anon read + insert scoped to this bucket (MVP device-scoped identity;
-- tightened to per-user folders in Stage I once auth lands).
drop policy if exists "cook-photos read" on storage.objects;
create policy "cook-photos read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'cook-photos');

drop policy if exists "cook-photos insert" on storage.objects;
create policy "cook-photos insert" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'cook-photos');
