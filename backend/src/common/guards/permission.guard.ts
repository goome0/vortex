import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EUserLevel } from '../imagine/imagine.interface';
import { IS_PUBLIC_KEY } from '../decorators/is-public-route.decorator';
import { REQUIRE_ADMIN_KEY } from '../decorators/require-admin.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { CurrentUserDTO } from '../dto/current-user.dto';

/**
 * Guard responsible for validating user permissions
 *
 * This guard checks if the user has the required permissions
 * to access a specific route.
 *
 * Rules:
 * 1. Public routes (@IsPublicRoute) do not require permissions
 * 2. Routes without @RequirePermission are accessible by authenticated users
 * 3. SUPER_ADMIN has access to all routes automatically
 * 4. Other users must have ALL permissions specified in @RequirePermission
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Get required permissions for the route
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Check if route requires admin
    const requireAdmin = this.reflector.getAllAndOverride<boolean>(REQUIRE_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Get authenticated user from request
    const request = context.switchToHttp().getRequest<{ user?: CurrentUserDTO }>();
    const user = request.user;

    // If no authenticated user, should not reach here (JwtAuthGuard should have blocked)
    // But for security, we block
    if (!user) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    const userLevel = Number(user.user_level ?? 0);
    const fullGmLevel: number = EUserLevel.FULL_GM;

    // FULL_GM (1000+) tem acesso a tudo
    if (userLevel >= fullGmLevel) {
      return true;
    }

    // If route requires admin and user is not FULL_GM, block
    if (requireAdmin) {
      throw new ForbiddenException('Only administrators can access this resource');
    }

    // If no required permissions, allow access (route protected only by authentication)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Check if user has permissions from database
    const userPermissions = user.permissions ?? [];

    // Check if user has ALL required permissions
    const hasAllPermissions = requiredPermissions.every((permission) => userPermissions.includes(permission));

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter((permission) => !userPermissions.includes(permission));

      throw new ForbiddenException(
        `You do not have permission to access this resource. Missing permissions: ${missingPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
