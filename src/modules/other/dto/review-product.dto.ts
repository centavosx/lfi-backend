import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsInt, IsNotEmpty } from 'class-validator';

const isInteger = (value: any): boolean => /^\+?(0|[1-9]\d*)$/.test(value);
const toNumber = (value: any): number => {
  return isInteger(value.value) ? parseInt(value.value) : value.value;
};

export class ReviewProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(toNumber)
  @IsInt()
  rate: number;
}
