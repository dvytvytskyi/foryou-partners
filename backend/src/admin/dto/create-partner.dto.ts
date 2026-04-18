import { Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsEmail, IsInt, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

class CreatePartnerUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  temp_password!: string;
}

export class CreatePartnerDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  tag_ids!: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  source_values?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePartnerUserDto)
  user?: CreatePartnerUserDto;
}
