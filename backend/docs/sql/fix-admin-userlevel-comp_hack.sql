-- Fix 401 Unauthorized when processing scheduled CP grants
-- The comp_hack API requires UserLevel=1000 (FULL_GM) for /admin/* endpoints.
-- Run this against the comp_hack database (not vortex).
--
-- If the account already has UserLevel=1000 but 401 persists, try:
-- 1. Set SCHEDULED_CP_SERVICE_USERNAME in backend .env to a known-working admin username
-- 2. Check comp_hack response body in logs (next 401 will log it)
-- 3. Verify IMAGINE_API points to the same comp_hack server used for sign-in

-- Set admin account to full GM (required for admin API)
UPDATE comp_hack.Account
SET UserLevel = 1000
WHERE LOWER(TRIM(Username)) = 'admin';

-- Verify (optional)
-- SELECT Username, UserLevel FROM comp_hack.Account WHERE LOWER(TRIM(Username)) = 'admin';
