import { SetMetadata } from '@nestjs/common';

/**
 * Chave usada para armazenar a flag de admin nos metadados da rota
 */
export const REQUIRE_ADMIN_KEY = 'requireAdmin';

/**
 * Decorator para exigir que o usuário seja um administrador (FULL_GM)
 *
 * Apenas usuários com user_level >= 1000 podem acessar rotas marcadas com este decorator.
 *
 * @example
 * @RequireAdmin()
 * getAccounts() { ... }
 */
export const RequireAdmin = () => SetMetadata(REQUIRE_ADMIN_KEY, true);
