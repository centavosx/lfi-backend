import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Delete,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';
import { CreateEventDto, SortEventDto } from '../dto';

import { Roles as RoleTypes } from '../../../enum';

import { EventsService } from '../services';
import { Parameter } from '../../../helpers';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @Get()
  public async getDailyEvents(
    @Query() { timeZone, startDate, endDate }: SortEventDto,
  ) {
    return await this.eventService.getEventByDay(
      timeZone,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Roles(RoleTypes.ADMIN_WRITE, RoleTypes.SUPER)
  @Post()
  public async createEvent(@Body() data: CreateEventDto) {
    return await this.eventService.createEvent(data);
  }

  @Roles(RoleTypes.ADMIN_WRITE, RoleTypes.SUPER)
  @Patch(Parameter.id())
  public async updateEvemt(
    @Param('id') id: string,
    @Body() data: CreateEventDto,
  ) {
    return await this.eventService.patchEvent(id, data);
  }

  @Get('/all')
  public async getMonthlyEvents(
    @Query() { timeZone, startDate, endDate }: SortEventDto,
  ) {
    return await this.eventService.getMonthlyEvents(
      timeZone,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Roles(RoleTypes.ADMIN_WRITE, RoleTypes.SUPER)
  @Delete(Parameter.id())
  public async deleteEvent(@Param('id') id: string) {
    return await this.eventService.deleteEvent(id);
  }
}
