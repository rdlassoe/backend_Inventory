import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
    import { Reflector } from '@nestjs/core';
    import { ROLES_KEY } from './roles.decorator';

    @Injectable()
    export class RolesGuard implements CanActivate {
      constructor(private reflector: Reflector) {}

      canActivate(context: ExecutionContext): boolean {
        // Obtenemos los roles requeridos para la ruta (definidos con @Roles)
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);

        // Si no se especifican roles con @Roles(), la ruta es accesible para cualquier usuario autenticado.
        if (!requiredRoles) {
          return true;
        }

        // Obtenemos el usuario del request (añadido por JwtAuthGuard)
        const { user } = context.switchToHttp().getRequest();

        // Comprobamos si el rol del usuario está incluido en los roles requeridos.
        return requiredRoles.some((role) => user.role?.includes(role));
      }
    }
    