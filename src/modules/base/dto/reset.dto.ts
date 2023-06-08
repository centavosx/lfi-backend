import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  public password: string;
}
