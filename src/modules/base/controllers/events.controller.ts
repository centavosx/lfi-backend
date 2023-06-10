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
  CreateEventDto,
  CreateUserDto,
  CreateUserFromAdminDto,
  DeleteDto,
  ForgotPassDto,
  LoginDto,
  ResetTokenDto,
  SearchSingle,
  SearchUserDto,
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
import { EventsService } from '../services';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @Roles(RoleTypes.ADMIN_WRITE, RoleTypes.SUPER)
  @Post()
  public async createUser(@Body() data: CreateEventDto) {
    return await this.eventService.createEvent(data);
  }
}
