import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PayoutType } from '@prisma/client';

export class RequestPayoutDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(PayoutType)
  type: PayoutType;

  @IsOptional()
  @IsString()
  details?: string;
}
