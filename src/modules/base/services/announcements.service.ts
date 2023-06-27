import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Announcements } from '../../../entities';
import { Repository, Raw } from 'typeorm';

import {
  ResponseDto,
  SearchDto,
  PostAnnouncementDto,
  UpdateAnnouncementDto,
} from '../dto';

import { NotFoundException } from '@nestjs/common/exceptions';

import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectQueue('notifQueue')
    private readonly notifQueue: Queue<{
      data: any;
      id: string;
      isNotif: boolean;
    }>,
    @InjectRepository(Announcements)
    private readonly announcementRepository: Repository<Announcements>,
  ) {}

  public async getOne(id: string) {
    const value = await this.announcementRepository.findOne({
      where: {
        id,
      },
    });

    if (!value) throw new NotFoundException('Not found');

    return value;
  }

  public async getAll(query: SearchDto): Promise<ResponseDto> {
    const data = await this.announcementRepository.find({
      where: {
        title: !!query.search
          ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
          : undefined,
      },
      order: !!query.sort
        ? {
            created: query.sort as 'asc' | 'desc',
          }
        : undefined,
      skip: (query.page ?? 0) * (query.limit ?? 20),
      take: query.limit ?? 20,
    });

    const total = await this.announcementRepository.count({
      where: {
        title: !!query.search
          ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
          : undefined,
      },
      order: !!query.sort
        ? {
            created: query.sort as 'asc' | 'desc',
          }
        : undefined,
    });
    return {
      data,
      total,
    };
  }

  public async postAnnouncement(data: PostAnnouncementDto) {
    this.notifQueue.add({
      data: {
        title: 'Announcement - ' + data.title,
        description: data.description,
      },
      id: 'all',
      isNotif: true,
    });

    return await this.announcementRepository.save({
      ...new Announcements(),
      ...data,
    });
  }

  public async patchAnnouncemnt(data: UpdateAnnouncementDto) {
    const announcement = await this.announcementRepository.findOne({
      where: {
        id: data.id,
      },
    });

    if (!announcement) throw new NotFoundException('Not found');

    Object.assign(announcement, {
      title: data.title,
      description: data.description,
    });

    return await this.announcementRepository.save(announcement);
  }

  public async deleteAnnouncement(id: string) {
    const announcement = await this.announcementRepository.findOne({
      where: {
        id,
      },
    });

    if (!announcement) throw new NotFoundException('Not found');

    return await this.announcementRepository.remove(announcement);
  }
}
