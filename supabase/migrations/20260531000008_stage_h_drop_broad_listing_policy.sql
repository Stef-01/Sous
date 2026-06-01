-- Stage H security fix (advisor: public_bucket_allows_listing).
-- A public bucket serves objects via their public URL WITHOUT a SELECT
-- policy on storage.objects. The broad "cook-photos read" policy created
-- in migration 0007 only enabled clients to LIST/enumerate every file in
-- the bucket — a privacy leak. Drop it; object URLs and uploads are
-- unaffected (verified: upsert:false upload + public URL fetch → 200).
drop policy if exists "cook-photos read" on storage.objects;
