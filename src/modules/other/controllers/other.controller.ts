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
} from '../dto';
import { OtherService } from '../services/other.service';
import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';
import { MailService } from '../../../mail/mail.service';
import { Response } from 'express';

import { SearchUserDto, DeleteDto } from '../../base/dto';

@ApiTags('other')
@Controller('other')
export class OtherController {
  constructor(
    private readonly otherService: OtherService,
    private readonly mailService: MailService,
  ) {}

  @Post('mail')
  public async sendMail(@Body() data: CreateEmailDto) {
    return await this.otherService.sendMail(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Get('mail')
  public async getAllMessage(@Query() data: SearchUserDto) {
    return await this.otherService.getAll(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Get('mail/' + Parameter.id())
  public async getMessage(
    @Param('id')
    id: string,
  ) {
    return await this.otherService.getMail(id);
  }

  @Roles(RoleTypes.ADMIN)
  @Patch('mail')
  public async deleteMessage(@Body() data: DeleteDto) {
    return await this.otherService.deleteMessage(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Post('mail/' + Parameter.id() + '/reply')
  public async replyMail(
    @Param('id')
    id: string,
    @Body() data: ReplyMailDto,
  ) {
    return await this.otherService.replyMail(id, data);
  }

  @Get('doctor')
  public async getDoctors(@Query() data: SearchDoctorDto) {
    return await this.otherService.searchDoctor(data);
  }

  @Get('doctor/' + Parameter.id() + '/information')
  public async getDoctorInfo(
    @Param('id')
    id: string,
    @Query()
    data: DateDto,
  ) {
    return await this.otherService.getDoctorInfo(
      id,
      data.date,
      data.hoursBetweenUtc,
    );
  }

  @Roles(RoleTypes.USER)
  @Post('/set-an-appoinment')
  public async setAppointment(
    @Query() query: TimezoneDto,
    @Body()
    data: CreateAppointmentDto,
  ) {
    return await this.otherService.setAppointment(data, query.timeZone);
  }

  @Roles(RoleTypes.USER)
  @Patch('verify/' + Parameter.id())
  public async verifyAppointment(
    @Param('id')
    id: string,
    @Body()
    data: VerifyAppointmentDto,
  ) {
    return await this.otherService.verifyAppointment(id, data);
  }

  @Roles(RoleTypes.USER)
  @Patch('refresh/' + Parameter.id())
  public async refreshAppointment(
    @Param('id')
    id: string,
  ) {
    return await this.otherService.refreshVerification(id);
  }

  @Get('unavailable')
  public async getAvailabilities(
    @Query() { timeZone, month, year }: GetAvailabilityDto,
  ) {
    return await this.otherService.getUnAvailableDates(timeZone, month, year);
  }

  @Get('transactions/success')
  public async successT(
    @Res() res: Response,
    @Query() { paymentId, PayerID }: PaypalDto,
  ) {
    await this.otherService.successTransaction(PayerID, paymentId, true);
    return res.redirect(process.env.MAIN_URL);
  }

  @Get('transactions/canceled')
  public async canceledT(
    @Res() res: Response,
    @Query() { paymentId, PayerID }: PaypalDto,
  ) {
    await this.otherService.successTransaction(PayerID, paymentId, false);
    return res.render('Canceled');
  }
}
