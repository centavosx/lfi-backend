import { Controller, Get, Post, Delete, Query, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';
import { PostAnnouncementDto, UpdateAnnouncementDto, SearchDto } from '../dto';
import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';

import { AnnouncementsService } from '../services';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementsService) {}

  @Roles('all')
  @Get()
  public async getAll(@Query() queryParameters: SearchDto) {
    return await this.announcementService.getAll(queryParameters);
  }

  @Roles('all')
  @Get(Parameter.id())
  public async getOne(@Param('id') id: string) {
    return await this.announcementService.getOne(id);
  }

  @Roles(RoleTypes.ADMIN_WRITE, RoleTypes.SUPER)
  @Post()
  public async postAnnouncement(@Body() data: PostAnnouncementDto) {
    return await this.announcementService.postAnnouncement(data);
  }

  @Roles(RoleTypes.SUPER, RoleTypes.ADMIN_WRITE)
  @Post()
  public async updateAnnouncement(@Body() data: UpdateAnnouncementDto) {
    return await this.announcementService.patchAnnouncemnt(data);
  }

  @Roles(RoleTypes.ADMIN_WRITE, RoleTypes.SUPER)
  @Delete(Parameter.id())
  public async deleteAnnouncement(@Param('id') id: string) {
    return await this.announcementService.deleteAnnouncement(id);
  }
}
