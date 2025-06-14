import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { Person } from './entities/person.entity';
import { TipoIdentificacion } from '../tipo-identificacion/entities/tipo-identificacion.entity'; // Importamos las entidades relacionadas
import { TypePerson } from '../type-person/entities/type-person.entity'; // Importamos las entidades relacionadas

@Module({
  // Importamos TypeOrmModule.forFeature para registrar las entidades que este
  // módulo utilizará. Esto hace que sus repositorios estén disponibles
  // para la inyección de dependencias en el PersonService.
  imports: [TypeOrmModule.forFeature([Person, TipoIdentificacion, TypePerson])],
  
  // Declaramos el controlador que pertenece a este módulo.
  controllers: [PersonController],
  
  // Declaramos el servicio como un "provider" para que NestJS pueda manejar
  // su instanciación y lo pueda inyectar en el controlador.
  providers: [PersonService],

  // Exportamos el PersonService para que otros módulos que importen PersonModule
  // puedan inyectar y usar este servicio. Por ejemplo, un futuro módulo de 'Ventas'
  // podría necesitar buscar un cliente por su ID.
  exports: [PersonService],
})
export class PersonModule {}
