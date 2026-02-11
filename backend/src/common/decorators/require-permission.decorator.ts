import { SetMetadata } from '@nestjs/common';

/**
 * Key used to store required permissions in route metadata
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to require specific permissions on a route
 *
 * @param permissions - Array of permissions required to access the route
 *
 * @example
 * // Require a specific permission
 * @RequirePermission(['create.manager'])
 * createManager() { ... }
 *
 * @example
 * // Require multiple permissions (user must have ALL of them)
 * @RequirePermission(['read.admin', 'update.admin'])
 * updateAdmin() { ... }
 *
 * @example
 * // Use with EPermission enum (recommended)
 * @RequirePermission([EPermission.CREATE_MANAGER])
 * createManager() { ... }
 */
export const RequirePermission = (permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
