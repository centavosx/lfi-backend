import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Appointment,
  Availability,
  ContactUs,
  Product,
  Replies,
  Role,
  Services,
  Status,
  User,
  UserPayment,
  UserTransaction,
} from '../../../entities';
import { Brackets, DataSource, ILike, Repository } from 'typeorm';

import {
  CreateAppointmentDto,
  CreateEmailDto,
  ReplyMailDto,
  SearchDoctorDto,
  VerifyAppointmentDto,
} from '../dto';

import { MailService } from '../../../mail/mail.service';
import { DeleteDto, ResponseDto, SearchUserDto } from '../../base/dto';
import { Roles } from '../../../enum';

import {
  addHours,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';
import { Paypal, getPaymentInfo } from '../../../paypal';

@Injectable()
export class OtherService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Services)
    private readonly serviceRepository: Repository<Services>,
    @InjectRepository(ContactUs)
    private readonly contactRepository: Repository<ContactUs>,
    @InjectRepository(Replies)
    private readonly replyRepository: Repository<Replies>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(UserPayment)
    private readonly userPayment: Repository<UserPayment>,
    @InjectRepository(UserTransaction)
    private readonly userTransaction: Repository<UserTransaction>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly mailService: MailService,
  ) {}

  public async getAll(query: SearchUserDto): Promise<ResponseDto> {
    const data = await this.contactRepository.find({
      where: !!query.search
        ? [
            {
              name: ILike(query.search + '%'),
            },
            {
              from: ILike(query.search + '%'),
            },
            {
              subject: ILike(query.search + '%'),
            },
          ]
        : undefined,
      skip: (query.page ?? 0) * (query.limit ?? 20),
      take: query.limit ?? 20,
    });

    const total = await this.contactRepository.count({
      where: !!query.search
        ? [
            {
              name: ILike(query.search + '%'),
            },
            {
              from: ILike(query.search + '%'),
            },
            {
              subject: ILike(query.search + '%'),
            },
          ]
        : undefined,
    });

    return {
      data,
      total,
    };
  }

  public async sendMail(data: CreateEmailDto) {
    const newContact = new ContactUs();
    Object.assign(newContact, data);
    await this.mailService.sendMail(data.from, data.subject, 'email', {});
    return await this.contactRepository.save(newContact);
  }

  public async getMail(id: string) {
    const contact = await this.contactRepository.findOne({
      where: {
        id,
      },
      relations: ['replies'],
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  public async replyMail(id: string, data: ReplyMailDto) {
    const contact = await this.contactRepository.findOne({
      where: {
        id,
      },
    });

    if (!contact) throw new NotFoundException('Contact not found');

    const newReply = new Replies();
    newReply.message = data.message;
    newReply.contact = contact;
    await this.mailService.sendMail(contact.from, contact.subject, 'reply', {
      name: contact.name,
      message: data.message,
      dateReplied:
        new Date().toDateString() + ' ' + new Date().toLocaleTimeString(),
    });

    return await this.replyRepository.save(newReply);
  }

  public async deleteMessage(data: DeleteDto) {
    const contacts = await this.contactRepository.findOne({
      where: data.ids.map((d) => ({ id: d })),
    });

    return await this.contactRepository.remove(contacts);
  }

  public async searchDoctor(data: SearchDoctorDto): Promise<ResponseDto> {
    const doctor = this.userRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.availability', 'availability')
      .leftJoinAndSelect('doctor.services', 'services');

    const count = this.userRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.availability', 'availability')
      .leftJoinAndSelect('doctor.services', 'services');

    if (!!data.id) {
      const whereCondition = new Brackets((sub) => {
        const query = `doctor.id = :id`;
        return sub.where(query, {
          id: data.id,
        });
      });

      doctor.andWhere(whereCondition);
      count.andWhere(whereCondition);
    }

    if (!!data.time) {
      const whereCondition = new Brackets((sub) => {
        const query = `TO_CHAR(availability.startDate + interval '${
          data.hoursBetweenUtc !== undefined ? data.hoursBetweenUtc : 8
        } hours', 'hh12:mi AM') LIKE :time OR TO_CHAR(availability.endDate + interval '${
          data.hoursBetweenUtc !== undefined ? data.hoursBetweenUtc : 8
        } hours', 'hh12:mi AM') LIKE :time`;
        return sub.where(query, {
          time: `%${data.time}%`,
        });
      });

      doctor.andWhere(whereCondition);
      count.andWhere(whereCondition);
    }

    if (!!data.name) {
      const whereCondition = new Brackets((sub) => {
        const query = `LOWER(doctor.name) LIKE LOWER(:name) OR LOWER(doctor.position) LIKE LOWER(:name)`;
        return sub.where(query, {
          name: `${data.name}%`,
        });
      });

      doctor.andWhere(whereCondition);
      count.andWhere(whereCondition);
    }

    if (!!data.day) {
      const whereCondition = new Brackets((sub) => {
        const query = `to_char(availability.startDate + interval '${
          data.hoursBetweenUtc !== undefined ? data.hoursBetweenUtc : 8
        } hours', 'day') LIKE :day OR to_char(availability.endDate + interval '${
          data.hoursBetweenUtc !== undefined ? data.hoursBetweenUtc : 8
        } hours', 'day') LIKE :day`;
        return sub.where(query, {
          day: `%${data.day}%`,
        });
      });

      doctor.andWhere(whereCondition);
      count.andWhere(whereCondition);
    }

    const serviceWhereCondition = new Brackets((sub) => {
      const query = !!data.serviceId
        ? `services.id = :id`
        : 'services IS NOT NULL';
      return sub.where(query, {
        id: data.serviceId,
      });
    });

    doctor.andWhere(serviceWhereCondition);
    count.andWhere(serviceWhereCondition);

    if (data.page && data.limit) {
      doctor.skip(Number(data.page) * Number(data.limit));
      doctor.take(Number(data.limit));
    }

    return {
      data: await doctor.getMany(),
      total: await count.getCount(),
    };
  }

  public async getDoctorInfo(id: string, date: Date, hoursBetweenUtc?: number) {
    const doctor = await this.userRepository.findOne({
      where: { id, roles: { name: Roles.DOCTOR } },
      relations: ['roles'],
    });

    const timeBetween =
      hoursBetweenUtc !== undefined ? Number(hoursBetweenUtc) : 8;

    if (!doctor) throw new NotFoundException('Doctor not found');

    const currDate = new Date(date);
    currDate.setHours(currDate.getHours() + timeBetween);

    doctor.hasAm = !!doctor.availability.some((d) => {
      const startDate = new Date(d.startDate);
      const endDate = new Date(d.endDate);

      startDate.setHours(startDate.getHours() + timeBetween);
      endDate.setHours(endDate.getHours() + timeBetween);

      return (
        currDate.getDay() === startDate.getDay() &&
        (startDate.getHours() < 12 || endDate.getHours() < 12)
      );
    });

    doctor.hasPm = !!doctor.availability.some((d) => {
      const startDate = new Date(d.startDate);
      const endDate = new Date(d.endDate);

      startDate.setHours(startDate.getHours() + timeBetween);
      endDate.setHours(endDate.getHours() + timeBetween);

      return (
        currDate.getDay() === startDate.getDay() &&
        (startDate.getHours() >= 12 || endDate.getHours() >= 12)
      );
    });

    return doctor;
  }

  public async setAppointment(data: CreateAppointmentDto, timeZone: string) {
    const service = await this.serviceRepository.findOne({
      where: { id: data.serviceId },
    });

    if (!service) throw new NotFoundException('Service not found');

    const newAppointment = new Appointment();

    const startDate = new Date(data.date);
    const endDate = addHours(startDate, 1);

    const start = this.beginingOfDay({
      date: startOfMonth(startDate),
      timeZone,
    });
    const end = addHours(start, 1);

    const dates = await this.getNotAvailabilityStatus(
      format(start, 'yyyy-MM-dd HH:mm:ss'),
      format(end, 'yyyy-MM-dd HH:mm:ss'),
      Status.accepted,
      timeZone,
    );

    if (dates.length === 0) {
      newAppointment.service = service;
      newAppointment.email = data.email;
      newAppointment.message = data.message;
      newAppointment.name = data.name;
      newAppointment.time = data.time;
      newAppointment.date = startDate;
      newAppointment.startDate = startDate;
      newAppointment.endDate = endDate;
      newAppointment.birthDate = data.birthDate;
      newAppointment.petName = data.petName;
      newAppointment.gender = data.gender;
      newAppointment.refId = (
        new Date().getTime().toString(36) + Math.random().toString(36).slice(8)
      ).toUpperCase();
      newAppointment.verification = Math.random()
        .toString(36)
        .slice(2)
        .toUpperCase();

      const savedData = await this.appointmentRepository.save(newAppointment);

      try {
        await this.mailService.sendMail(
          savedData.email,
          'Please verify your appointment',
          'verification',
          {
            name: savedData.name,
            code: savedData.verification,
          },
        );
      } catch {}

      delete savedData.refId;
      delete savedData.verification;

      return savedData;
    }

    throw new ConflictException('Date conflicted');
  }

  public async verifyAppointment(id: string, data: VerifyAppointmentDto) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.verification === data.verification) {
      appointment.verification = null;
      await this.appointmentRepository.save(appointment);
      await this.mailService.sendMail(
        appointment.email,
        'Your booking is now verified',
        'verified',
        {
          name: appointment.name,
          code: appointment.refId,
        },
      );

      const paypal = new Paypal({
        items: [
          {
            name: 'downpayment',
            sku: appointment.id,
            price: '100',
            currency: 'PHP',
            quantity: 1,
          },
        ],
        currency: 'PHP',
        price: '100',
        successUrl: process.env.API_URL + 'other/transactions/success',
        cancelledUrl: process.env.API_URL + 'other/transactions/canceled',
        description: 'downpayment',
        state: data.timeZone,
      });

      const link = (await paypal.create().pay()).link;

      return link;
    }

    throw new BadRequestException('Invalid verification code');
  }

  public async successTransaction(
    payerId: string,
    paymentId: string,
    isSuccess: boolean,
  ) {
    const { id, transactions } = await getPaymentInfo(payerId, paymentId);
    const check = await this.userPayment.find({
      where: {
        paypalId: id,
      },
    });

    if (check.length > 0) throw new ForbiddenException();

    const descr = transactions[0].description.split(', State=');

    const isDown = descr[0] === 'downpayment';

    const payments: UserPayment[] = [];

    let userT: User;

    for (const i of transactions[0].item_list.items) {
      const uPay = new UserPayment();

      uPay.paypalId = id;
      uPay.refId = transactions[0].reference_id;
      uPay.status = isSuccess ? 'PAID' : 'CANCELED';
      if (i.name === 'downpayment' && isDown) {
        uPay.appointmentId = i.sku;
        const appointment = await this.appointmentRepository.findOne({
          where: { id: i.sku },
          relations: ['service'],
        });

        if (!!appointment) {
          if (!userT) {
            const user = await this.userRepository.findOne({
              where: {
                email: appointment.email,
              },
            });
            if (!!user) userT = user;
          }

          uPay.user = userT;
          appointment.status = Status.accepted;
          const updated = await this.appointmentRepository.save(appointment);
          const start = new Date(
            new Date(updated.startDate).toLocaleString('en-US', {
              timeZone: descr[1],
            }),
          );
          const end = new Date(
            new Date(updated.endDate).toLocaleString('en-US', {
              timeZone: descr[1],
            }),
          );
          await this.mailService.sendMail(
            appointment.email,
            'Your booking is now approved!',
            'appointment',
            {
              refId: updated.refId,
              name: updated.name,
              status: updated.status,
              time:
                !!updated.startDate && !!updated.endDate
                  ? 'Time: ' +
                    format(start, 'EEEE, LLLL do yyyy  hh:mm a') +
                    ' to ' +
                    format(end, 'EEEE, LLLL do yyyy  hh:mm a')
                  : '',

              service: appointment.service.name,
              price: i.price,
            },
          );
        }
      } else {
        const transaction = await this.userTransaction.findOne({
          where: { id: i.sku },
          relations: !userT ? ['user', 'product'] : ['product'],
        });
        if (!!transaction) {
          if (!!transaction.user) userT = transaction.user;
          transaction.product.items -= i.quantity;
          await this.productRepo.save(transaction.product);
        }

        uPay.user = userT;
        uPay.transactionId = i.sku;
      }

      payments.push(uPay);
    }

    await this.userPayment.save(payments);
  }

  public async refreshVerification(id: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    appointment.verification = Math.random()
      .toString(36)
      .slice(2)
      .toUpperCase();

    const savedData = await this.appointmentRepository.save(appointment);

    await this.mailService.sendMail(
      savedData.email,
      'Please verify your appointment',
      'verification',
      {
        name: savedData.name,
        code: savedData.verification,
      },
    );

    delete savedData.refId;
    delete savedData.verification;

    return savedData;
  }

  private beginingOfDay(options: { date: Date; timeZone: string }) {
    const { date = new Date(), timeZone } = options;
    const parts = Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).formatToParts(date);
    const hour = parseInt(parts.find((i) => i.type === 'hour').value);
    const minute = parseInt(parts.find((i) => i.type === 'minute').value);
    const second = parseInt(parts.find((i) => i.type === 'second').value);
    return new Date(
      1000 *
        Math.floor(
          (date.getTime() - hour * 3600000 - minute * 60000 - second * 1000) /
            1000,
        ),
    );
  }

  private getStartAndEnd(timeZone: string, month: number, year: number) {
    const date = new Date();
    date.setMonth(month);
    date.setFullYear(year);
    const start = this.beginingOfDay({ date: startOfMonth(date), timeZone });
    const end = addMonths(start, 1);

    return {
      startAt: format(start, 'yyyy-MM-dd HH:mm:ss'),
      endAt: format(end, 'yyyy-MM-dd HH:mm:ss'),
    };
  }

  private async getNotAvailabilityStatus(
    startAt: string,
    endAt: string,
    status: string,
    timeZone: string,
  ): Promise<
    {
      date: string;
    }[]
  > {
    return await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select(
        "TO_CHAR(timezone(:timeZone, appointment.startDate), 'yyyy-mm-dd hh24') as date",
      )
      .distinct(true)
      .where(
        `appointment.startDate >= timezone(current_setting('TIMEZONE'), :startAt) AND appointment.endDate <= timezone(current_setting('TIMEZONE'), :endAt) 
          AND status = :status AND (appointment.startDate IS NOT NULL OR appointment.endDate IS NOT NULL) AND appointment.verification IS NULL`,
      )
      .groupBy('appointment.startDate')
      .setParameters({
        status,
        timeZone,
        startAt,
        endAt,
      })
      .getRawMany();
  }

  public async getUnAvailableDates(
    timeZone: string,
    month: number,
    year: number,
  ) {
    const { startAt, endAt } = this.getStartAndEnd(timeZone, month, year);

    const dates = await this.getNotAvailabilityStatus(
      startAt,
      endAt,
      Status.accepted,
      timeZone,
    );

    return dates;
  }
}
