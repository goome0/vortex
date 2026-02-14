-- Fix 401 Unauthorized when processing scheduled CP grants
-- The comp_hack API requires UserLevel=1000 (FULL_GM) for /admin/* endpoints.
-- Run this against the comp_hack database (not vortex).

-- Set admin account to full GM (required for admin API)
UPDATE comp_hack.Account
SET UserLevel = 1000
WHERE LOWER(TRIM(Username)) = 'admin';

-- Verify (optional)
-- SELECT Username, UserLevel FROM comp_hack.Account WHERE LOWER(TRIM(Username)) = 'admin';
