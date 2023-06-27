import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from '../../authentication/services/token.service';
import { MailService } from '../../mail/mail.service';
import { MailProcessor } from '../../mail/mail.processor';
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
import { BullModule } from '@nestjs/bull';
import { FirebaseQueueProcessor } from '../../firebaseapp';

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
    BullModule.registerQueue({
      name: 'emailQueue',
    }),
    BullModule.registerQueue({
      name: 'notifQueue',
    }),
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
    MailProcessor,
    FirebaseQueueProcessor,
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
    BullModule.registerQueue({
      name: 'emailQueue',
    }),
    BullModule.registerQueue({
      name: 'notifQueue',
    }),
  ],
})
export class BaseModule {}
