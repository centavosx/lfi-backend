import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../../entities';
import { Repository } from 'typeorm';
import { CreateRoleDto } from '../dto/create-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  public async createRole(data: CreateRoleDto) {
    const isUserExist = await this.roleRepository.findOne({
      where: {
        name: data.role,
      },
    });

    if (!!isUserExist) throw new ConflictException('Role already exist');

    const newRole = new Role();

    Object.assign(newRole, { name: data.role });

    const role = await this.roleRepository.save(newRole);

    return role;
  }
}
