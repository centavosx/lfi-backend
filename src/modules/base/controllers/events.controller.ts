import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';
import { CreateEventDto, SortEventDto } from '../dto';

import { Roles as RoleTypes } from '../../../enum';

import { EventsService } from '../services';

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
  public async createUser(@Body() data: CreateEventDto) {
    return await this.eventService.createEvent(data);
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
}
