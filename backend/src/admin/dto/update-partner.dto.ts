import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePartnerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  tag_ids?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  source_values?: string[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
