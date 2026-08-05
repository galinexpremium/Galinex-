-- Revoke EXECUTE on handle_new_user from authenticated (only the auth trigger should call it)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
-- is_admin is intentionally callable by authenticated users (it's read-only and needed for admin checks)
-- Keep it GRANTed to authenticated only (already done in previous migration)
