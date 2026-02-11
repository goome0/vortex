import { SetMetadata } from '@nestjs/common';

/**
 * Key used to store the admin flag in route metadata
 */
export const REQUIRE_ADMIN_KEY = 'requireAdmin';

/**
 * Decorator to require the user to be an administrator (FULL_GM)
 *
 * Only users with user_level >= 1000 can access routes marked with this decorator.
 *
 * @example
 * @RequireAdmin()
 * getAccounts() { ... }
 */
export const RequireAdmin = () => SetMetadata(REQUIRE_ADMIN_KEY, true);
