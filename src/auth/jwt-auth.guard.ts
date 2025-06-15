import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Este guard invoca automáticamente la lógica de nuestra JwtStrategy.
 * Si el token es válido, permite el acceso. Si no, devuelve un error 401 Unauthorized.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
