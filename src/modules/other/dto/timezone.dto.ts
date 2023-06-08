import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class TimezoneDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  timeZone: string;
}
