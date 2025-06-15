import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // Importamos UserModule para acceder a UserService
import { JwtStrategy } from './jwt.strategy';     // La crearemos en el siguiente paso

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Usaremos variables de entorno
        signOptions: { expiresIn: '1h' }, // El token expira en 1 hora
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy], // Registramos el servicio y la estrategia
  controllers: [AuthController],
  exports: [PassportModule, JwtModule], // Exportamos para poder usar los guards en otros módulos
})
export class AuthModule {}