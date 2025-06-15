import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      // Extrae el token del encabezado 'Authorization' como un Bearer Token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // No ignora la expiración del token
      ignoreExpiration: false,
      // Usa el secreto del archivo .env
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Este método se ejecuta automáticamente después de que el token es validado.
   * El payload es el objeto que pusimos en el token al hacer login.
   * @param payload - El contenido decodificado del JWT.
   */
  async validate(payload: any) {
    // Lo que retornemos aquí será añadido al objeto 'request' como 'req.user'
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}