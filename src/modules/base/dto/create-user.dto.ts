import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Education, Level, Roles, UserStatus } from '../../../enum';
const toNumber = (value: any): number => {
  return !isNaN(value.value) ? Number(value.value) : value.value;
};

export class UserInformationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Level)
  level: Level;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Education)
  education: Education;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  program: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(toNumber)
  @IsNumber()
  lastGwa: number;

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
  autobiography: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gradeSlip: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  homeVisitProof: string;

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
}

export class CreateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  picture?: string;

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
  @IsEnum(Education)
  education: Education;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(toNumber)
  @IsNumber()
  lastGwa: number;

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
  autobiography: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  homeSketch: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  homeVisitProof: string;

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
  @IsString()
  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(Roles, { each: true })
  role: Roles[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserInformationDto)
  userData?: UserInformationDto;
}

export class SuperUserDto {
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
  @IsString()
  @IsNotEmpty()
  password: string;
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

export class ScholarDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  lastGwa: number;
}

export class RenewalDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  lastGwa: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Level)
  level: Level;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEnum(Education)
  education: Education;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  program: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  gradeSlip: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  enrollmentBill?: string;
}

export class SubmitEnrolmentBillDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  enrollmentBill: string;
}
