import { ApiProperty } from '@nestjs/swagger';

import { IsArray } from 'class-validator';

type DateProps = {
  startDate: string | null;
  endDate: string | null;
};

type TimeSetterProps = [
  DateProps[],
  DateProps[],
  DateProps[],
  DateProps[],
  DateProps[],
  DateProps[],
  DateProps[],
];

export class TimeSetterDto {
  @ApiProperty()
  @IsArray()
  time: TimeSetterProps;
}
