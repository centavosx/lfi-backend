import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Patch,
  Query,
  Body,
  Put,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';
import {
  CreateEmailDto,
  DateDto,
  ReplyMailDto,
  SearchDoctorDto,
  CreateAppointmentDto,
  VerifyAppointmentDto,
  GetAvailabilityDto,
  TimezoneDto,
  PaypalDto,
  SearchProductDto,
  ReviewProductDto,
} from '../dto';
import { OtherService } from '../services/other.service';
import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';
import { MailService } from '../../../mail/mail.service';
import { Response } from 'express';

import { SearchUserDto, DeleteDto } from '../../base/dto';
import { ProductService } from '../services';
import { User as UserDecorator } from '../../../decorators';
import { User } from '../../../entities';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly otherService: OtherService,
    private readonly productService: ProductService,
    private readonly mailService: MailService,
  ) {}

  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  @Get()
  public async getProducts(@Query() queries: SearchProductDto) {
    return await this.productService.getAll(queries);
  }

  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  @Get(Parameter.id())
  public async getProductInfo(@Param('id') id: string) {
    return await this.productService.getInfo(id);
  }

  @Roles(RoleTypes.USER)
  @Put('review/' + Parameter.id())
  public async reviewProduct(
    @Param('id') id: string,
    @UserDecorator() user: User,
    @Body() data: ReviewProductDto,
  ) {
    return await this.productService.reviewProduct(id, user, data);
  }
}
