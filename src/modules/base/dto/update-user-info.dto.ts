import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Education, Level, UserStatus } from '../../../enum';
import { Transform } from 'class-transformer';
const toNumber = (value: any): number => {
  return !isNaN(value.value) ? Number(value.value) : value.value;
};

export class UserInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  picture?: string;

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
  @IsEnum(Education)
  education?: Education;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toNumber)
  @IsNumber()
  lastGwa?: number;

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
  homeVisitProof: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isShsGraduate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCollegeGraduate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  scholarStatus?: 'pending' | 'started' | 'ended' | 'rejected' | 'verify';
}
