import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from '../../authentication/services/token.service';
import { MailService } from '../../mail/mail.service';
import {
  Role,
  User,
  Token,
  Events,
  Announcements,
  UserFiles,
  Scholar,
} from '../../entities';
import {
  AnnouncementController,
  BaseController,
  DashboardController,
  EventsController,
  RoleController,
} from './controllers';
import {
  AnnouncementsService,
  BaseService,
  DashboardService,
  EventsService,
  RoleService,
} from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Token,
      Events,
      Announcements,
      UserFiles,
      Scholar,
    ]),
  ],
  controllers: [
    BaseController,
    RoleController,
    AnnouncementController,
    EventsController,
    DashboardController,
  ],
  providers: [
    BaseService,
    RoleService,
    MailService,
    TokenService,
    EventsService,
    AnnouncementsService,
    DashboardService,
  ],
  exports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Token,
      Events,
      Announcements,
      UserFiles,
      Scholar,
    ]),
  ],
})
export class BaseModule {}
