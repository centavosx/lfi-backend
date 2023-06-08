import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Level, Roles } from '../../../enum';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fname: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mname?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Level)
  level: Level;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  program: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idPic: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ncae: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  certificate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pantawid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gradeSlip: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  birthCert: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  homeSketch: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  waterBill?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  electricBill?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wifiBill?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  enrollmentBill?: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CreateUserFromAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fname: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mname?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lname: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Roles, { each: true })
  role: Roles[];
}

export class UpdateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Roles, { each: true })
  role: Roles[];
}

export class CodeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}
