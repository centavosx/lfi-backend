import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

enum AmOrPm {
  AM = 'AM',
  PM = 'PM',
}

enum Days {
  sun = 'sunday',
  mon = 'monday',
  tue = 'tuesday',
  wed = 'wednesday',
  thur = 'thursday',
  fri = 'friday',
  sat = 'saturday',
}

const isInteger = (value: any): boolean => /^\+?(0|[1-9]\d*)$/.test(value);
const toNumber = (value: any): number => {
  return isInteger(value.value) ? parseInt(value.value) : value.value;
};

export class SearchDoctorDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  // @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AmOrPm)
  @IsString()
  time?: AmOrPm;

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
  @IsEnum(Days)
  @IsString()
  day?: Days;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  hoursBetweenUtc?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;
}

export class DateDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  hoursBetweenUtc?: number;
}
