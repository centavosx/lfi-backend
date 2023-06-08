import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { ConfigService, ConfigModule } from '@nestjs/config';
import { AppointmentModule, BaseModule } from './modules';

import { TokenService } from './authentication/services/token.service';
import {
  AuthMiddleware,
  RefreshMiddleware,
} from './authentication/middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from './guards/roles.guard';
import { MailService } from './mail/mail.service';
import { RefreshController } from './authentication/controller/refresh.controller';
import { dataSourceOptions } from './config/config';
import { ServiceModule } from './modules/service/service.module';
import { OtherModule } from './modules/other/other.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceOptions),
    AppointmentModule,
    BaseModule,
    ServiceModule,
    OtherModule,
  ],
  controllers: [RefreshController],
  providers: [ConfigService, TokenService, RolesGuard, MailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/refresh', method: RequestMethod.GET },
        { path: '/user/reset', method: RequestMethod.POST },
      )
      .forRoutes('*');
    consumer
      .apply(RefreshMiddleware)
      .forRoutes(
        { path: '/refresh', method: RequestMethod.GET },
        { path: '/user/reset', method: RequestMethod.POST },
      );
  }
}
