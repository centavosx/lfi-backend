import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Announcements, Events, Role, User } from '../../../entities';
import { DataSource, Repository, Raw, In } from 'typeorm';

import { CreateEventDto } from '../dto';

import { MailService } from '../../../mail/mail.service';

import { generateColor } from '../../../helpers';

@Injectable()
export class EventsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Events)
    private readonly eventRepository: Repository<Events>,
    private readonly mailService: MailService,
  ) {}

  public async createEvent(data: CreateEventDto) {
    return await this.eventRepository.save({
      ...new Events(),
      ...data,
      color: generateColor(),
    });
  }
}
