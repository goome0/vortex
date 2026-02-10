import { SetMetadata } from '@nestjs/common';

/**
 * Chave usada para armazenar as permissões necessárias nos metadados da rota
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator para exigir permissões específicas em uma rota
 *
 * @param permissions - Array de permissões necessárias para acessar a rota
 *
 * @example
 * // Requer uma permissão específica
 * @RequirePermission(['create.manager'])
 * createManager() { ... }
 *
 * @example
 * // Requer múltiplas permissões (usuário precisa ter TODAS)
 * @RequirePermission(['read.admin', 'update.admin'])
 * updateAdmin() { ... }
 *
 * @example
 * // Usar com enum EPermission (recomendado)
 * @RequirePermission([EPermission.CREATE_MANAGER])
 * createManager() { ... }
 */
export const RequirePermission = (permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
