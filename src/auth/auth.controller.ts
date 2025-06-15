import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard'; // Lo crearemos en el siguiente paso

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para el inicio de sesión.
   * POST /auth/login
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  
  /**
   * Endpoint de ejemplo para verificar el token y obtener datos del usuario logueado.
   * GET /auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // req.user es añadido por el guard después de validar el token.
    // Contiene el payload del JWT (userId, username, role).
    return req.user;
  }
}

