import { IsArray, IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetLeadsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size?: number = 20;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : String(value).split(',')))
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsISO8601()
  date_from?: string;

  @IsOptional()
  @IsISO8601()
  date_to?: string;

  @IsOptional()
  @IsIn(['updated_at', 'created_at'])
  sort_by?: 'updated_at' | 'created_at' = 'updated_at';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort_dir?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  partner_id?: string;
}
