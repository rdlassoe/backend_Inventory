import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida si las credenciales de un usuario son correctas.
   * @param username - El nombre de usuario.
   * @param pass - La contraseña en texto plano.
   * @returns El objeto del usuario sin la contraseña si es válido, de lo contrario null.
   */
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && await bcrypt.compare(pass, user.password)) {
      // Si la validación es exitosa, devolvemos el usuario sin la contraseña.
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Maneja el proceso de login.
   * @param loginDto - Credenciales del usuario.
   * @returns Un token de acceso si el login es exitoso.
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    
    // El payload del token contendrá el ID de usuario, el nombre de usuario y el rol.
    // Esta información estará disponible en las rutas protegidas.
    const payload = { sub: user.iduser, username: user.username, role: user.role };
    
    return {
      message: 'Inicio de sesión exitoso',
      access_token: this.jwtService.sign(payload),
    };
  }
}
