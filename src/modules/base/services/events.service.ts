import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Events, User } from '../../../entities';
import { DataSource, Repository } from 'typeorm';
import { format } from 'date-fns';
import { CreateEventDto } from '../dto';

import { MailService } from '../../../mail/mail.service';

import { generateColor } from '../../../helpers';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EventsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectQueue('notifQueue')
    private readonly notifQueue: Queue<{
      data: any;
      id: string;
      isNotif: boolean;
    }>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Events)
    private readonly eventRepository: Repository<Events>,
    private readonly mailService: MailService,
  ) {}

  public async getEventByDay(timeZone: string, startDate: Date, endDate: Date) {
    const start = format(startDate, 'yyyy-MM-dd HH:mm:ss');
    const end = format(endDate, 'yyyy-MM-dd HH:mm:ss');

    return await this.eventRepository.query(
      `
        SELECT id, name, description, color, start_date, end_date
        FROM 
          (SELECT 
            CASE 
              WHEN TO_CHAR(dates,'YYYY-MM-DD') = TO_CHAR(start_date,'YYYY-MM-DD')
              THEN dates
              ELSE date_trunc('day', dates) AT TIME ZONE $3
            END as start_date, 
            id, name, description, color, end_date
            FROM (
                SELECT generate_series(start_date, end_date, '1 day') as dates, timezone($3, start_date) as start_date, id, name, description, color, end_date
                FROM "events") "event"
            WHERE 
            CASE 
              WHEN TO_CHAR(dates,'YYYY-MM-DD') = TO_CHAR(start_date,'YYYY-MM-DD')
              THEN dates
              ELSE date_trunc('day', dates) AT TIME ZONE $3
            END BETWEEN $1 AND $2
          ) "event_gen"
`,
      [start, end, timeZone],
    );
  }

  public async getMonthlyEvents(
    timeZone: string,
    startDate: Date,
    endDate: Date,
  ) {
    const start = format(startDate, 'yyyy-MM-dd HH:mm:ss');
    const end = format(endDate, 'yyyy-MM-dd HH:mm:ss');

    return await this.eventRepository.query(
      `
      SELECT id, name, description, color, start_date, DATE_PART('day', start_date AT TIME ZONE $3) as "day" FROM  (
        SELECT id, name, description, color, start_date,
        ROW_NUMBER() over (partition by start_date order by start_date ASC) as rank
        FROM 
          (SELECT 
            CASE 
              WHEN TO_CHAR(dates,'YYYY-MM-DD') = TO_CHAR(start_date,'YYYY-MM-DD')
              THEN dates
              ELSE date_trunc('day', dates) AT TIME ZONE $3
            END as start_date, 
            id, name, description, color
            FROM (
                SELECT generate_series(start_date, end_date, '1 day') as dates, timezone($3, start_date) as start_date, id, name, description, color
                FROM "events") "event"
            WHERE 
            CASE 
              WHEN TO_CHAR(dates,'YYYY-MM-DD') = TO_CHAR(start_date,'YYYY-MM-DD')
              THEN dates
              ELSE date_trunc('day', dates) AT TIME ZONE $3
            END BETWEEN $1 AND $2
          ) "event_gen"
      ) "ev_grouped"
      WHERE rank = 1
`,
      [start, end, timeZone],
    );
  }

  public async createEvent(data: CreateEventDto) {
    this.notifQueue.add({
      data: {
        title: 'Event - ' + data.name,
        description: data.description,
      },
      id: 'all',
      isNotif: true,
    });

    return await this.eventRepository.save({
      ...new Events(),
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      color: generateColor(),
    });
  }

  public async patchEvent(id: string, data: CreateEventDto) {
    const event = await this.eventRepository.findOne({
      where: {
        id,
      },
    });
    if (!event) throw new NotFoundException();

    Object.assign(event, data);

    return await this.eventRepository.save(event);
  }

  public async deleteEvent(id: string) {
    const event = await this.eventRepository.findOne({
      where: {
        id,
      },
    });

    if (!event) throw new NotFoundException();

    return await this.eventRepository.remove(event);
  }
}
