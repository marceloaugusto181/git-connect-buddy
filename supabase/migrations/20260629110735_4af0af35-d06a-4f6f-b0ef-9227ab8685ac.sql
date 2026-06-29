
-- 1) Lock down SECURITY DEFINER functions (only used by triggers)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_phi_access() FROM PUBLIC, anon, authenticated;

-- 2) Hide tables from pg_graphql for anon/authenticated (app uses PostgREST, not GraphQL)
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA graphql FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA graphql FROM anon, authenticated;

-- 3) Restrict storage listing on public buckets to file owners.
--    Public CDN reads (object.publicUrl) are unaffected; only object listing/metadata via the API is restricted.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Users can read their own avatar"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Resources are publicly accessible" ON storage.objects;
CREATE POLICY "Therapists can read their own resources files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);
