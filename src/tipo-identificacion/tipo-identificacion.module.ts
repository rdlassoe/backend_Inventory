import { Module } from '@nestjs/common';
import { TipoIdentificacionService } from './tipo-identificacion.service';
import { TipoIdentificacionController } from './tipo-identificacion.controller';

@Module({
  controllers: [TipoIdentificacionController],
  providers: [TipoIdentificacionService],
})
export class TipoIdentificacionModule {}
