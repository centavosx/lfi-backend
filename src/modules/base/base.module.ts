import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from '../../authentication/services/token.service';
import { MailService } from '../../mail/mail.service';
import { Role, User, Token, Events, Announcements } from '../../entities';
import {
  AnnouncementController,
  BaseController,
  EventsController,
  RoleController,
} from './controllers';
import {
  AnnouncementsService,
  BaseService,
  EventsService,
  RoleService,
} from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Token, Events, Announcements]),
  ],
  controllers: [
    BaseController,
    RoleController,
    AnnouncementController,
    EventsController,
  ],
  providers: [
    BaseService,
    RoleService,
    MailService,
    TokenService,
    EventsService,
    AnnouncementController,
  ],
  exports: [
    TypeOrmModule.forFeature([User, Role, Token, Events, Announcements]),
  ],
})
export class BaseModule {}
