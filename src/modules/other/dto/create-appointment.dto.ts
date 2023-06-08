import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { AmOrPm, Gender } from '../../../entities';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  petName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  birthDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  age: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEnum(AmOrPm)
  time: AmOrPm;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message: string;
}

export class VerifyAppointmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  verification: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  timeZone: string;
}
