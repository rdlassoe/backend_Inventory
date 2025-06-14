import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Person } from '../person/entities/person.entity'; // Importamos la entidad Person
import { PersonModule } from '../person/person.module'; // Podríamos importar PersonModule si necesitamos sus servicios

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Person]), // Registramos User y Person para poder usar sus repositorios
    // PersonModule // Opcional: si necesitáramos inyectar PersonService aquí
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Exportamos por si otro módulo necesita verificar usuarios (ej. Autenticación)
})
export class UserModule {}
