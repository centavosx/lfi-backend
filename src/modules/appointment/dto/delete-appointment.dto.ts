import { ApiProperty } from '@nestjs/swagger';

export class DeleteAppointmentDto {
  @ApiProperty()
  id: string[];
}
