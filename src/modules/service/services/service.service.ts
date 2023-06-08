import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Services } from '../../../entities';
import { DataSource, ILike, Repository } from 'typeorm';

import { CreateServiceDto, SearchServiceDto, UpdateServiceDto } from '../dto';
import { DeleteDto, ResponseDto } from '../../base/dto';

@Injectable()
export class ServiceService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Services)
    private readonly serviceRepository: Repository<Services>,
  ) {}

  public async getService(query: SearchServiceDto) {
    const data = await this.serviceRepository.findOne({
      where: {
        name: query.search,
      },
    });
    if (!data) throw new NotFoundException('Service not found');
    return data;
  }

  public async getAll(query: SearchServiceDto): Promise<ResponseDto> {
    const data = await this.serviceRepository.find({
      where: {
        name: !!query.search ? ILike(query.search + '%') : undefined,
        id: query.id,
      },

      skip: (query.page ?? 0) * (query.limit ?? 50),
      take: query.limit ?? 50,
    });

    const total = await this.serviceRepository.count({
      where: {
        name: !!query.search ? ILike(query.search + '%') : undefined,
        id: query.id,
      },
    });
    return {
      data,
      total,
    };
  }

  public async addService(data: CreateServiceDto) {
    const service = await this.serviceRepository.findOne({
      where: {
        name: data.name,
      },
    });
    if (!service) {
      const newService = new Services();
      Object.assign(newService, data);
      return await this.serviceRepository.save(newService);
    }
    throw new ConflictException('This service already exist');
  }

  public async deleteServices(data: DeleteDto) {
    return await this.serviceRepository.delete(data.ids);
  }

  public async updateService({ id, name, description }: UpdateServiceDto) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException();

    if (!!name) service.name = name;
    if (!!description) service.description = description;

    await this.serviceRepository.save(service);

    return;
  }
}
