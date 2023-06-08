import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { IsNotEmpty, IsString, IsInt } from 'class-validator';

const isInteger = (value: any): boolean => /^\+?(0|[1-9]\d*)$/.test(value);
const toNumber = (value: any): number => {
  return isInteger(value.value) ? parseInt(value.value) : value.value;
};

export class GetAvailabilityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  timeZone: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(toNumber)
  @IsInt()
  month: number;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(toNumber)
  @IsInt()
  year: number;
}
