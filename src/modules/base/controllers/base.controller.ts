import {
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Query,
  Body,
  Headers,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';
import {
  CodeDto,
  CreateUserDto,
  DeleteDto,
  ForgotPassDto,
  IdDto,
  LoginDto,
  RegisterUserDto,
  ResetTokenDto,
  SearchSingle,
  SearchUserDto,
  TimeSetterDto,
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
  constructor(
    private readonly baseService: BaseService,
    private readonly mailService: MailService,
  ) {}

  @Roles(RoleTypes.ADMIN)
  @Get()
  public async getAll(@Query() queryParameters: SearchUserDto) {
    return await this.baseService.getAll(queryParameters);
  }

  @Roles(RoleTypes.ADMIN, RoleTypes.USER)
  @Get(Parameter.id() + '/information')
  public async getUser(
    @User() user: Usertype,
    @Param('id')
    id: string,
  ) {
    const userId = id === 'me' ? user.id : id;
    if (
      user.roles.every(
        (v) => v.name === RoleTypes.USER || v.name !== RoleTypes.ADMIN,
      ) &&
      id !== 'me'
    )
      throw new ForbiddenException('Not allowed');
    return await this.baseService.getUser(userId);
  }

  @Roles(RoleTypes.ADMIN)
  @Post()
  public async createUser(@Body() data: CreateUserDto) {
    return await this.baseService.createUser(data);
  }

  @Post('/register')
  public async registerUser(@Body() data: RegisterUserDto) {
    return await this.baseService.createUser(data, true);
  }

  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  @Post('/verify')
  public async verifyUser(@User() user: Usertype, @Body() { code }: CodeDto) {
    return await this.baseService.verifyUser(code, user);
  }

  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
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

  @Roles(RoleTypes.ADMIN)
  @Post(Parameter.id() + '/service')
  public async addService(
    @Param('id')
    id: string,
    @Body() data: IdDto,
  ) {
    return await this.baseService.addService(id, data);
  }

  @Roles(RoleTypes.ADMIN)
  @Delete(Parameter.id() + '/service')
  public async deleteService(
    @Param('id')
    id: string,
    @Query() data: IdDto,
  ) {
    return await this.baseService.deleteService(id, data);
  }

  @Roles(RoleTypes.ADMIN)
  @Get('search')
  public async searchUser(@Query() search: SearchSingle) {
    return await this.baseService.getUser(undefined, search.email, search.role);
  }

  @Roles(RoleTypes.ADMIN)
  @Put('/role')
  public async updateRole(@Body() data: CreateUserDto) {
    return await this.baseService.updateRole(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Patch('/role')
  public async removeRole(
    @Query() query: SearchUserDto,
    @Body() data: DeleteDto,
  ) {
    return await this.baseService.removeRole(data, query);
  }

  @Roles(RoleTypes.ADMIN)
  @Put(Parameter.id() + '/availability')
  public async updateAvailability(
    @Param('id') id: string,
    @Body() data: TimeSetterDto,
  ) {
    return await this.baseService.updateAvailability(id, data);
  }

  @Post('/reset')
  public async resetToken(
    @User() user: Usertype | undefined,
    @Token() token: string | undefined,
    @Body() dto: ResetTokenDto,
  ) {
    return await this.baseService.resetToken(user, token, dto);
  }

  @Roles(RoleTypes.ADMIN)
  @Patch('/update-users')
  public async updateUsersData(@Body() users: UserInfoDto) {
    return await this.baseService.updateUsers(users);
  }
}
