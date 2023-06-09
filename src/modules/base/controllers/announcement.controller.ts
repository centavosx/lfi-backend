import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';
import {
  CodeDto,
  CreateUserDto,
  CreateUserFromAdminDto,
  DeleteDto,
  ForgotPassDto,
  LoginDto,
  ResetTokenDto,
  SearchSingle,
  SearchUserDto,
  PostAnnouncementDto,
  UpdateRoleDto,
} from '../dto';
import { BaseService } from '../services/base.service';
import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';
import { MailService } from '../../../mail/mail.service';
import { Token, User } from '../../../decorators';
import { User as Usertype } from '../../../entities';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { UserInfoDto } from '../dto/update-user-info.dto';
import { AnnouncementsService } from '../services';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementsService) {}

  @Roles('all')
  @Get()
  public async getAll(@Query() queryParameters: SearchUserDto) {
    return await this.announcementService.getAll(queryParameters);
  }

  @Roles(RoleTypes.ADMIN_WRITE, RoleTypes.SUPER)
  @Post()
  public async postAnnouncement(@Body() data: PostAnnouncementDto) {
    return await this.announcementService.postAnnouncement(data);
  }
}
