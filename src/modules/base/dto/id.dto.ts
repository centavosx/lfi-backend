import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class IdDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  id: string;
}
