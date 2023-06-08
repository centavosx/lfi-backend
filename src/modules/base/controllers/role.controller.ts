import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleService } from '../services/role.service';

@ApiTags('role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  public async createrole(@Body() data: CreateRoleDto) {
    return await this.roleService.createRole(data);
  }
}
