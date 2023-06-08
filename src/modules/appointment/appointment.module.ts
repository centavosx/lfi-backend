import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from 'src/authentication/services/token.service';
import { Replies } from 'src/entities/replies.entity';
import { MailService } from 'src/mail/mail.service';
import {
  Role,
  User,
  Token,
  Services,
  Availability,
  ContactUs,
  Appointment,
} from '../../entities';
import { AppointmentController } from './controllers';
import { AppointmentService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Services, Appointment])],
  controllers: [AppointmentController],
  providers: [AppointmentService, MailService],
})
export class AppointmentModule {}
