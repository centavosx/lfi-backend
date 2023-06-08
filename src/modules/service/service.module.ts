import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, Services } from '../../entities';
import { ServiceController } from './controllers';
import { ServiceService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Services])],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [TypeOrmModule.forFeature([Services])],
})
export class ServiceModule {}
