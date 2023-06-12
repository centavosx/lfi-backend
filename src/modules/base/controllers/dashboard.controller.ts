import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { DashboardDto } from '../dto';

import { DashboardService } from '../services';
import { Roles } from '../../../decorators';
import { Roles as RoleTypes } from '../../../enum';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(RoleTypes.SUPER, RoleTypes.ADMIN_READ)
  @Get()
  public async getAll(@Query() { timeZone }: DashboardDto) {
    return await this.dashboardService.getDashboard(timeZone);
  }
}
