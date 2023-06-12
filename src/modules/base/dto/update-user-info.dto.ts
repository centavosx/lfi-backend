import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Level, UserStatus } from '../../../enum';

export class UserInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Level)
  level?: Level;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idPic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ncae?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pantawid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gradeSlip?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  autobiography?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthCert?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeSketch?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  old?: string;
}
