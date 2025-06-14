import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoIdentificacion } from './entities/tipo-identificacion.entity';
import { TipoIdentificacionController } from './tipo-identificacion.controller';
import { TipoIdentificacionService } from './tipo-identificacion.service';

@Module({
  // Esta línea es la que "provee" el repositorio que el servicio necesita.
  // Asegúrate de que esté presente.
  imports: [TypeOrmModule.forFeature([TipoIdentificacion])],
  controllers: [TipoIdentificacionController],
  providers: [TipoIdentificacionService],
})
export class TipoIdentificacionModule {}
