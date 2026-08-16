import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateIncomeDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'Income amount must be greater than zero' })
  amount?: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
