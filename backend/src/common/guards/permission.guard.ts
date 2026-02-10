import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EUserLevel } from '../imagine/imagine.interface';
import { IS_PUBLIC_KEY } from '../decorators/is-public-route.decorator';
import { REQUIRE_ADMIN_KEY } from '../decorators/require-admin.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { CurrentUserDTO } from '../dto/current-user.dto';

/**
 * Guard responsável por validar as permissões do usuário
 *
 * Este guard verifica se o usuário tem as permissões necessárias
 * para acessar uma rota específica.
 *
 * Regras:
 * 1. Rotas públicas (@IsPublicRoute) não requerem permissões
 * 2. Rotas sem @RequirePermission são acessíveis por usuários autenticados
 * 3. SUPER_ADMIN tem acesso a todas as rotas automaticamente
 * 4. Outros usuários precisam ter TODAS as permissões especificadas em @RequirePermission
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verifica se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Obtém as permissões necessárias para a rota
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Verifica se a rota requer admin
    const requireAdmin = this.reflector.getAllAndOverride<boolean>(REQUIRE_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Obtém o usuário autenticado do request
    const request = context.switchToHttp().getRequest<{ user?: CurrentUserDTO }>();
    const user = request.user;

    // Se não há usuário autenticado, não deveria chegar aqui (JwtAuthGuard deveria ter bloqueado)
    // Mas por segurança, bloqueamos
    if (!user) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso');
    }

    const userLevel = Number(user.user_level ?? 0);
    const fullGmLevel: number = EUserLevel.FULL_GM;

    // FULL_GM (1000+) tem acesso a tudo
    if (userLevel >= fullGmLevel) {
      return true;
    }

    // Se a rota requer admin e o usuário não é FULL_GM, bloqueia
    if (requireAdmin) {
      throw new ForbiddenException('Apenas administradores podem acessar este recurso');
    }

    // Se não há permissões requeridas, permite acesso (rota protegida apenas por autenticação)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Verifica se o usuário tem as permissões do banco de dados
    const userPermissions = user.permissions ?? [];

    // Verifica se o usuário tem TODAS as permissões necessárias
    const hasAllPermissions = requiredPermissions.every((permission) => userPermissions.includes(permission));

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter((permission) => !userPermissions.includes(permission));

      throw new ForbiddenException(
        `Você não tem permissão para acessar este recurso. Permissões faltantes: ${missingPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
