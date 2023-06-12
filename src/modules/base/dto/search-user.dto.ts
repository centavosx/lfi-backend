import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { Roles, UserStatus } from '../../../enum';

const isInteger = (value: any): boolean => /^\+?(0|[1-9]\d*)$/.test(value);
const toNumber = (value: any): number => {
  return isInteger(value.value) ? parseInt(value.value) : value.value;
};

export class SearchUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Roles, { each: true })
  role?: Roles[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(UserStatus, { each: true })
  status?: UserStatus[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;
}

export class SearchSingle {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Roles)
  role?: Roles;
}
