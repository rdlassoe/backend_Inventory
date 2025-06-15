import { SetMetadata } from '@nestjs/common';

    export const ROLES_KEY = 'roles';
    /**
     * Decorador para asignar los roles requeridos a un endpoint.
     * Ejemplo de uso: @Roles('admin', 'vendedor')
     * @param roles - Una lista de los roles permitidos.
     */
    export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
