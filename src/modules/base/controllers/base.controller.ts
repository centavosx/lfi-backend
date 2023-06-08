import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';
import {
  CodeDto,
  CreateUserDto,
  CreateUserFromAdminDto,
  DeleteDto,
  ForgotPassDto,
  LoginDto,
  ResetTokenDto,
  SearchSingle,
  SearchUserDto,
  UpdateRoleDto,
} from '../dto';
import { BaseService } from '../services/base.service';
import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';
import { MailService } from '../../../mail/mail.service';
import { Token, User } from '../../../decorators';
import { User as Usertype } from '../../../entities';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { UserInfoDto } from '../dto/update-user-info.dto';

@ApiTags('user')
@Controller('user')
export class BaseController {
  constructor(private readonly baseService: BaseService) {}

  @Roles(RoleTypes.ADMIN_READ, RoleTypes.SUPER)
  @Get()
  public async getAll(@Query() queryParameters: SearchUserDto) {
    return await this.baseService.getAll(queryParameters);
  }

  @Roles(RoleTypes.ADMIN_READ, RoleTypes.SUPER, RoleTypes.USER)
  @Get(Parameter.id() + '/information')
  public async getUser(
    @User() user: Usertype,
    @Param('id')
    id: string,
  ) {
    const userId = id === 'me' ? user.id : id;
    if (
      user.roles.every(
        (v) =>
          v.name === RoleTypes.USER ||
          (v.name !== RoleTypes.SUPER && v.name !== RoleTypes.ADMIN_READ),
      ) &&
      id !== 'me'
    )
      throw new ForbiddenException('Not allowed');
    return await this.baseService.getUser(userId);
  }

  @Roles(RoleTypes.ADMIN_WRITE, RoleTypes.SUPER)
  @Post()
  public async createUser(
    @Body() data: CreateUserFromAdminDto,
    @User() user: Usertype,
  ) {
    if (
      !user.roles.some((v) => v.name === RoleTypes.SUPER) &&
      data.role.some((v) => v !== RoleTypes.USER)
    )
      throw new ForbiddenException('Not allowed');
    return await this.baseService.createUser(data);
  }

  @Get()
  @Post('/register')
  public async registerUser(@Body() data: CreateUserDto) {
    return await this.baseService.createUser(data, true);
  }

  @Roles(
    RoleTypes.USER,
    RoleTypes.ADMIN,
    RoleTypes.ADMIN_READ,
    RoleTypes.ADMIN_WRITE,
    RoleTypes.SUPER,
  )
  @Post('/verify')
  public async verifyUser(@User() user: Usertype, @Body() { code }: CodeDto) {
    return await this.baseService.verifyUser(code, user);
  }

  @Roles(
    RoleTypes.USER,
    RoleTypes.ADMIN,
    RoleTypes.ADMIN_READ,
    RoleTypes.ADMIN_WRITE,
    RoleTypes.SUPER,
  )
  @Get('/refresh-code')
  public async refreshCode(@User() user: Usertype) {
    return await this.baseService.refreshCode(user);
  }

  @Get('/forgot-pass')
  public async forgotPass(
    @Query() { email }: ForgotPassDto,
    @Headers('origin') origin: string,
  ) {
    return await this.baseService.forgotPass(email, origin);
  }

  @Post('/login')
  public async loginUser(@Body() data: LoginDto) {
    return await this.baseService.loginUser(data, true);
  }

  @Post('/regularLogin')
  public async regularLogin(@Body() data: LoginDto) {
    return await this.baseService.loginUser(data);
  }

  @Roles(RoleTypes.ADMIN_READ, RoleTypes.SUPER)
  @Get('search')
  public async searchUser(@Query() search: SearchSingle) {
    return await this.baseService.getUser(undefined, search.email, search.role);
  }

  @Roles(RoleTypes.SUPER)
  @Patch('/role')
  public async updateRole(@Body() data: UpdateRoleDto) {
    return await this.baseService.updateRole(data);
  }

  @Roles(RoleTypes.SUPER)
  @Patch('/role/delete')
  public async removeRole(
    @Query() query: SearchUserDto,
    @Body() data: DeleteDto,
  ) {
    return await this.baseService.removeRole(data, query);
  }

  @Post('/reset')
  public async resetToken(
    @User() user: Usertype | undefined,
    @Token() token: string | undefined,
    @Body() dto: ResetTokenDto,
  ) {
    return await this.baseService.resetToken(user, token, dto);
  }

  @Roles(RoleTypes.ADMIN_WRITE, RoleTypes.SUPER)
  @Patch('/update-user')
  public async updateUsersData(@Body() users: UserInfoDto) {
    return await this.baseService.updateUsers(users);
  }
}
