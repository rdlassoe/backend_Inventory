import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTypeMovementDto {
  @IsString()
  @IsNotEmpty()
  readonly description: string;
}