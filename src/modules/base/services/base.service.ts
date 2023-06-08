import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Availability, Role, Services, User } from '../../../entities';
import { DataSource, Repository, Raw } from 'typeorm';

import {
  LoginDto,
  CreateUserDto,
  SearchUserDto,
  ResponseDto,
  DeleteDto,
  IdDto,
  TimeSetterDto,
  RegisterUserDto,
  ResetTokenDto,
} from '../dto';

import { ifMatched, hashPassword } from '../../../helpers/hash.helper';
import { TokenService } from '../../../authentication/services/token.service';
import { Roles } from '../../../enum';
import { MailService } from '../../../mail/mail.service';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { UserInfoDto } from '../dto/update-user-info.dto';

function pad(d: number) {
  return d < 10 ? '0' + d.toString() : d.toString();
}

@Injectable()
export class BaseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Services)
    private readonly serviceRepository: Repository<Services>,
    @InjectRepository(Availability)
    private readonly availabilityRepository: Repository<Availability>,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  public async getAll(query: SearchUserDto): Promise<ResponseDto> {
    const findData = {
      id: query.id,
      services: !!query.serviceId
        ? {
            id: query.serviceId,
          }
        : undefined,
      roles: !!query.role
        ? {
            name: query.role,
          }
        : undefined,
    };

    const data = await this.userRepository.find({
      where: [
        {
          name: !!query.search
            ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
            : undefined,
          ...findData,
        },
        {
          email: !!query.search
            ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
            : undefined,
          ...findData,
        },
      ],
      skip: (query.page ?? 0) * (query.limit ?? 20),
      take: query.limit ?? 20,
      relations: ['roles', 'services'],
    });

    const total = await this.userRepository.count({
      where: [
        {
          name: !!query.search
            ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
            : undefined,
          ...findData,
        },
        {
          email: !!query.search
            ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
            : undefined,
          ...findData,
        },
      ],

      relations: ['roles', 'services'],
    });
    return {
      data,
      total,
    };
  }

  public async getUser(
    id: string | undefined,
    email?: string,
    roleName?: Roles,
  ) {
    let role;

    if (!!roleName) {
      role = await this.roleRepository.findOne({
        where: { name: roleName },
      });
    }

    const data = await this.userRepository.findOne({
      where: {
        id: id,
        email: email,
        roles: !!roleName ? [role] : undefined,
      },
    });
    if (!!data) return data;
    throw new NotFoundException();
  }

  public async verifyUser(code: string, user: User) {
    if (user.code === code) {
      user.verified = true;
      user.code = null;
      const newU = await this.userRepository.save(user);
      const tokens = await this.tokenService.generateTokens(newU);
      await this.tokenService.whitelistToken(tokens.refreshToken, user.id);
      return tokens;
    }
    throw new UnauthorizedException('Invalid code');
  }

  public async refreshCode(user: User) {
    user.verified = false;
    user.code = Math.random().toString(36).slice(2).toUpperCase();
    const newUser = await this.userRepository.save(user);

    await this.mailService.sendMail(
      newUser.email,
      'Please verify your account',
      'verification-user',
      {
        name: newUser.name,
        code: newUser.code,
      },
    );

    return newUser;
  }

  public async addUser(
    data: CreateUserDto | RegisterUserDto,
    role: Role,
    isVerification?: boolean,
  ) {
    let user: User;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newUser = new User();

      Object.assign(newUser, {
        ...data,
        password: !!data.password
          ? await hashPassword(data.password)
          : undefined,
        roles: [
          {
            id: role.id,
            name: role.name,
          },
        ],
        verified: isVerification ? false : true,
        code: isVerification
          ? Math.random().toString(36).slice(2).toUpperCase()
          : false,
      } as User);

      user = await this.userRepository.save(newUser);

      if (isVerification)
        await this.mailService.sendMail(
          user.email,
          'Please verify your account',
          'verification-user',
          {
            name: user.name,
            code: user.code,
          },
        );

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
    if (isVerification && !!user) {
      const tokens = await this.tokenService.generateTokens(user);
      await this.tokenService.whitelistToken(tokens.refreshToken, user.id);
      return tokens;
    }
    return user;
  }

  public async createUser(
    data: CreateUserDto | RegisterUserDto,
    isVerification?: boolean,
  ) {
    let dataToSave: CreateUserDto | RegisterUserDto | User = data;
    const isUserExist = await this.userRepository.findOne({
      where: {
        email: dataToSave.email,
      },
    });

    if (!!isUserExist) {
      if (!!isUserExist.verified)
        throw new ConflictException('User already exist');
      dataToSave = isUserExist;
    }

    const role = await this.roleRepository.findOne({
      where: {
        name: (dataToSave as any).role ?? Roles.USER,
      },
    });

    if (!role) throw new NotFoundException('Role not found');
    return await this.addUser(
      {
        ...dataToSave,
        roles: undefined,
        services: undefined,
        availability: undefined,
        appointment: undefined,
        created: undefined,
        modified: undefined,
      } as any,
      role,
      isVerification,
    );
  }

  public async loginUser(data: LoginDto, isAdmin?: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        email: data.email,
        roles: isAdmin
          ? {
              name: Roles.ADMIN,
            }
          : [
              {
                name: Roles.ADMIN,
              },
              {
                name: Roles.USER,
              },
            ],
      },
      relations: ['roles'],
    });

    if (!user || !user.verified) throw new NotFoundException('User not found');

    if (!(await ifMatched(data.password, user.password)))
      throw new BadRequestException('Wrong password');

    const tokens = await this.tokenService.generateTokens(user);
    await this.tokenService.whitelistToken(tokens.refreshToken, user.id);
    return tokens;
  }

  public async updateRole(data: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    const role = await this.roleRepository.findOne({
      where: {
        name: data.role,
      },
    });

    if (!role) throw new NotFoundException('Role not found');

    if (!!user) {
      user.roles.push(role);
      return await this.userRepository.save(user);
    }

    return await this.addUser(data, role);
  }

  public async removeRole(data: DeleteDto, query: SearchUserDto) {
    const users = await this.userRepository.find({
      where: data.ids.map((d) => ({ id: d })),
    });

    const userToUpdate: User[] = [];
    const userToDelete: string[] = [];

    if (!!query.role)
      for (const v in users) {
        users[v].roles = users[v].roles.filter((d) => d.name !== query.role);
        if (users[v].roles.length > 0) {
          userToUpdate.push(users[v]);
        } else {
          userToDelete.push(users[v].id);
        }
      }

    if (userToUpdate.length > 0) await this.userRepository.save(userToUpdate);
    if (userToDelete.length > 0) {
      await this.tokenService.unlistUserIds(userToDelete);
      await this.availabilityRepository
        .createQueryBuilder('availability')
        .leftJoin('availability.user', 'user')
        .where(`user.id IN (:...ids)`, { ids: userToDelete })
        .delete()
        .execute();
      await this.userRepository.delete(userToDelete);
    }

    return;
  }

  public async addService(id: string, data: IdDto) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const newService = await this.serviceRepository.findOne({
      where: {
        id: data.id,
      },
    });

    if (!newService) throw new NotFoundException('Service not found');
    if (user.services.some((d) => d.id === newService.id))
      throw new ConflictException('Service is already added in this account');
    user.services.push(newService);

    return await this.userRepository.save(user);
  }

  public async deleteService(id: string, data: IdDto) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.services.some((d) => d.id === data.id)) {
      user.services = user.services.filter((d) => d.id !== data.id);
      return await this.userRepository.save(user);
    }
    throw new ConflictException('Service is not added in this account');
  }

  public async updateAvailability(id: string, data: TimeSetterDto) {
    const availability = await this.availabilityRepository.find({
      where: {
        user: {
          id,
        },
      },
      relations: ['user'],
    });

    await this.availabilityRepository.remove(availability);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const availabilities: Availability[] = [];

    for (const i in data.time) {
      const index = parseInt(i);
      for (const val of data.time[index]) {
        const currDay = new Date();
        const distance = (index + 7 - currDay.getDay()) % 7;
        currDay.setDate(currDay.getDate() + distance);

        const currDate =
          pad(currDay.getMonth() + 1) +
          '-' +
          pad(currDay.getDate()) +
          '-' +
          currDay.getFullYear();

        const startDate = new Date(val.startDate);

        const endDate = new Date(val.endDate);

        const startTime =
          pad(startDate.getHours()) +
          ':' +
          pad(startDate.getMinutes()) +
          ':' +
          pad(startDate.getSeconds());

        const endTime =
          pad(endDate.getHours()) +
          ':' +
          pad(endDate.getMinutes()) +
          ':' +
          pad(endDate.getSeconds());

        const firstDate = new Date(currDate + ' ' + startTime);
        const secondDate = new Date(currDate + ' ' + endTime);

        const newAvail = new Availability();

        newAvail.startDate = firstDate;
        newAvail.endDate = secondDate;
        newAvail.user = user;
        availabilities.push(newAvail);
      }
    }

    return await this.availabilityRepository.save(availabilities);
  }

  public async forgotPass(email: string, origin: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    const token = await this.tokenService.generateResetToken(user);
    await this.tokenService.whitelistToken(token, user.id);
    await this.mailService.sendMail(
      user.email,
      'Reset Password',
      'reset-user',
      {
        name: user.name,
        link: origin + '/reset?token=' + token,
      },
    );
    return;
  }

  public async resetToken(user: User, token: string, dto: ResetTokenDto) {
    if (!user) throw new UnauthorizedException('Unauthorized');
    user.password = await hashPassword(dto.password);
    try {
      await this.tokenService.unlistToken(token, user.id);
    } catch {}
    await this.userRepository.save(user);
    return;
  }

  public async updateUsers({
    id,
    name,
    position,
    description,
    password,
    old,
  }: UserInfoDto) {
    const userData = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userData) throw new NotFoundException();

    if (!!name) userData.name = name;

    if (!!position) userData.position = position;

    if (!!description) userData.description = description;

    if (!!old && !(await ifMatched(old, userData.password)))
      throw new BadRequestException('Wrong old password');

    if (!!password) userData.password = await hashPassword(password);

    await this.userRepository.save(userData);

    return;
  }
}
