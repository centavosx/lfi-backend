import { Controller, Get, Post, Query, Body, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Roles } from '../../../decorators/roles.decorator';

import { ServiceService } from '../services';
import { Roles as RoleTypes } from '../../../enum';

import { CreateServiceDto, SearchServiceDto, UpdateServiceDto } from '../dto';
import { DeleteDto } from '../../base/dto';

@ApiTags('service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  public async getAll(@Query() queryParameters: SearchServiceDto) {
    return await this.serviceService.getAll(queryParameters);
  }

  @Roles(RoleTypes.ADMIN)
  @Post()
  public async addService(@Body() data: CreateServiceDto) {
    return await this.serviceService.addService(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Post('delete')
  public async deleteServices(@Body() data: DeleteDto) {
    return await this.serviceService.deleteServices(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Get('search')
  public async getService(@Query() queryParameters: SearchServiceDto) {
    return await this.serviceService.getService(queryParameters);
  }

  @Roles(RoleTypes.ADMIN)
  @Patch()
  public async updateService(@Body() data: UpdateServiceDto) {
    return await this.serviceService.updateService(data);
  }
}
