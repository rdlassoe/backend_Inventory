import { IsDateString, IsNotEmpty } from 'class-validator';

export class ComparisonQueryDto {
  @IsDateString()
  @IsNotEmpty()
  readonly startDate1: string;

  @IsDateString()
  @IsNotEmpty()
  readonly endDate1: string;

  @IsDateString()
  @IsNotEmpty()
  readonly startDate2: string;

  @IsDateString()
  @IsNotEmpty()
  readonly endDate2: string;
}
