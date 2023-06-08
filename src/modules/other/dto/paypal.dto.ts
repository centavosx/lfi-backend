import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class PaypalDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  PayerID: string;
}
