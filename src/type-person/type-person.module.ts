import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypePerson } from './entities/type-person.entity';
import { TypePersonController } from './type-person.controller';
import { TypePersonService } from './type-person.service';

@Module({
  imports: [TypeOrmModule.forFeature([TypePerson])],
  controllers: [TypePersonController],
  providers: [TypePersonService],
})
export class TypePersonModule {}