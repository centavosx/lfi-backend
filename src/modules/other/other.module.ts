import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Replies } from '../../entities/replies.entity';
import { MailService } from '../../mail/mail.service';
import {
  Role,
  User,
  Token,
  Services,
  Availability,
  ContactUs,
  Appointment,
  UserPayment,
  UserTransaction,
  Product,
  ProductReview,
} from '../../entities';
import { OtherController, ProductController } from './controllers';
import { OtherService, ProductService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Token,
      Services,
      Availability,
      ContactUs,
      Replies,
      Appointment,
      UserPayment,
      UserTransaction,
      Product,
      ProductReview,
    ]),
  ],
  controllers: [OtherController, ProductController],
  providers: [OtherService, MailService, ProductService],
})
export class OtherModule {}
