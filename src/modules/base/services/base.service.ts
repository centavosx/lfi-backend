import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from '../../../entities';
import { DataSource, Repository, Raw, In } from 'typeorm';

import {
  LoginDto,
  CreateUserDto,
  SearchUserDto,
  ResponseDto,
  DeleteDto,
  ResetTokenDto,
  CreateUserFromAdminDto,
  UpdateRoleDto,
  SuperUserDto,
} from '../dto';

import { ifMatched, hashPassword } from '../../../helpers/hash.helper';
import { TokenService } from '../../../authentication/services/token.service';
import { Roles, UserStatus } from '../../../enum';
import { MailService } from '../../../mail/mail.service';
import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { UserInfoDto } from '../dto/update-user-info.dto';

@Injectable()
export class BaseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  public async getAll(query: SearchUserDto): Promise<ResponseDto> {
    const findData = {
      id: query.id,
      roles: !!query.role
        ? {
            name: In(query.role),
          }
        : undefined,
      status: !!query.status ? In(query.status) : undefined,
    };

    const data = await this.userRepository.find({
      where: [
        {
          fname: !!query.search
            ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
            : undefined,

          ...findData,
        },
        {
          mname: !!query.search
            ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
            : undefined,
          ...findData,
        },
        {
          lname: !!query.search
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
      relations: ['roles'],
    });

    const total = await this.userRepository.count({
      where: [
        {
          fname: !!query.search
            ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
            : undefined,
          ...findData,
        },
        {
          mname: !!query.search
            ? Raw((v) => `LOWER(${v}) LIKE LOWER('${query.search}%')`)
            : undefined,
          ...findData,
        },
        {
          lname: !!query.search
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

      relations: ['roles'],
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
      user.status = UserStatus.VERIFIED;
      user.code = null;
      const newU = await this.userRepository.save(user);
      const tokens = await this.tokenService.generateTokens(newU);
      await this.tokenService.whitelistToken(tokens.refreshToken, user.id);
      return tokens;
    }
    throw new BadRequestException('Invalid code');
  }

  public async refreshCode(user: User) {
    user.status = UserStatus.PENDING;
    user.code = Math.random().toString(36).slice(2).toLowerCase();
    const newUser = await this.userRepository.save(user);

    await this.mailService.sendMail(
      newUser.email,
      'Please verify your account',
      'verification',
      {
        code: newUser.code,
      },
    );

    return newUser;
  }

  public async acceptUser(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('Not founc');
  }

  public async addUser(
    data: CreateUserDto | CreateUserFromAdminDto,
    roles: Role[],
    isVerification?: boolean,
  ) {
    let user: User;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newUser = new User();

      const isAdmin = roles.every((v) => v.name !== Roles.USER);

      const pw =
        !isVerification &&
        (isAdmin || ('userData' in data && data.status === UserStatus.ACTIVE))
          ? Math.random().toString(36).slice(2) +
            Math.random().toString(36).toUpperCase().slice(2)
          : undefined;

      Object.assign(newUser, {
        ...data,
        password: !!pw ? await hashPassword(pw) : undefined,
        code: isVerification
          ? Math.random().toString(36).slice(2).toLowerCase()
          : undefined,
        ...('userData' in data
          ? {
              ...data.userData,
              accepted: data.status === UserStatus.ACTIVE ? new Date() : null,
            }
          : {}),
      });

      user = await this.userRepository.save(newUser);

      const checkAndAddUser = await this.userRepository.findOne({
        where: {
          id: user.id,
        },
        relations: ['roles'],
      });

      checkAndAddUser.roles = roles;

      await this.userRepository.save(checkAndAddUser);

      try {
        if (isVerification) {
          await this.mailService.sendMail(
            user.email,
            'Please verify your account',
            'verification',
            {
              code: user.code,
            },
          );
        } else if (
          'userData' in data &&
          data.status === UserStatus.ACTIVE &&
          !isAdmin
        ) {
          //new user
          await this.mailService.sendMail(
            user.email,
            'You have been accepted',
            'acceptance-scholar',
            {
              email: checkAndAddUser.email,
              password: pw,
            },
          );
        } else {
          await this.mailService.sendMail(
            user.email,
            'Your admin account',
            'acceptance-admin',
            {
              email: user.email,
              password: pw,
            },
          );
        }
      } catch {}

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

  public async createSuperUser(data: SuperUserDto) {
    const newUser = new User();
    const role = await this.roleRepository.findOne({
      where: {
        name: Roles.SUPER,
      },
    });

    newUser.roles = [role];

    Object.assign(newUser, {
      ...data,
      password: await hashPassword(data.password),
      status: UserStatus.ACTIVE,
    });

    return await this.userRepository.save(newUser);
  }

  public async createUser(
    data: CreateUserDto | CreateUserFromAdminDto,
    isVerification?: boolean,
  ) {
    let dataToSave: CreateUserDto | CreateUserFromAdminDto | User = data;

    const isUserExist = await this.userRepository.findOne({
      where: {
        email: dataToSave.email,
      },
    });

    if (!!isUserExist) {
      if (isUserExist.status === UserStatus.EXPELLED)
        throw new ForbiddenException('This user is expelled');
      if (
        isUserExist.status === UserStatus.ACTIVE ||
        isUserExist.status === UserStatus.VERIFIED
      )
        throw new ConflictException('This user already exist');
      dataToSave = isUserExist;
    }

    const role = await this.roleRepository.find({
      where: {
        name: !!(dataToSave as CreateUserFromAdminDto).role
          ? In((dataToSave as CreateUserFromAdminDto).role)
          : Roles.USER,
      },
    });

    if (!role) throw new NotFoundException('Role not found');
    return await this.addUser(
      {
        ...dataToSave,
      } as any,
      role,
      isVerification,
    );
  }

  public async loginUser(data: LoginDto, isAdmin?: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        email: data.email,
        roles: !isAdmin
          ? {
              name: Roles.USER,
            }
          : [
              {
                name: Roles.ADMIN,
              },
              {
                name: Roles.ADMIN_READ,
              },
              {
                name: Roles.ADMIN_WRITE,
              },
              {
                name: Roles.SUPER,
              },
            ],
      },
      relations: ['roles'],
    });

    if (!!user && user.status === UserStatus.EXPELLED)
      throw new NotFoundException('This user is expelled');

    if (
      !user ||
      user.status === UserStatus.PENDING ||
      user.status === UserStatus.CANCELED
    )
      throw new NotFoundException('User not found');

    if (!(await ifMatched(data.password, user.password)))
      throw new BadRequestException('Wrong password');

    const tokens = await this.tokenService.generateTokens(user);
    await this.tokenService.whitelistToken(tokens.refreshToken, user.id);
    return tokens;
  }

  public async updateRole(data: UpdateRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: data.id },
    });
    const role = await this.roleRepository.find({
      where: {
        name: In(data.role),
      },
    });

    if (!role) throw new NotFoundException('Role not found');

    if (!!user) {
      user.roles = role;
      return await this.userRepository.save(user);
    }

    return;
  }

  public async removeRole(data: DeleteDto, query: SearchUserDto) {
    const users = await this.userRepository.find({
      where: data.ids.map((d) => ({ id: d })),
    });

    const userToUpdate: User[] = [];
    const userToDelete: string[] = [];
    console.log(query);
    if (!!query.role)
      for (const v in users) {
        users[v].roles = users[v].roles.filter(
          (d) => !query.role.includes(d.name),
        );
        if (users[v].roles.length > 0) {
          userToUpdate.push(users[v]);
        } else {
          userToDelete.push(users[v].id);
        }
      }

    if (userToUpdate.length > 0) await this.userRepository.save(userToUpdate);
    if (userToDelete.length > 0) {
      await this.tokenService.unlistUserIds(userToDelete);
      await this.userRepository.delete(userToDelete);
    }

    return;
  }

  public async forgotPass(email: string, origin: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user?.status !== UserStatus.ACTIVE) return;
    const token = await this.tokenService.generateResetToken(user);
    await this.tokenService.whitelistToken(token, user.id);
    await this.mailService.sendMail(
      user.email,
      'Forgot password',
      'forgot-password',
      {
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

  public async logout(user: User) {
    await this.tokenService.unlistUserIds([user.id]);
    return;
  }

  public async updateUsers(
    { id, password, old, ...rest }: UserInfoDto & { id: string },
    user: User,
  ) {
    const userData = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userData) throw new NotFoundException();

    const isUser = userData.roles.some((v) => v.name === Roles.USER);
    if (!isUser && !user.roles.some((v) => v.name === Roles.SUPER))
      throw new ForbiddenException('Not allowed');

    const isAccepted =
      rest.status === UserStatus.ACTIVE &&
      userData.status !== UserStatus.ACTIVE &&
      isUser;

    const isExpelled =
      rest.status === UserStatus.EXPELLED &&
      userData.status !== UserStatus.EXPELLED &&
      isUser;

    const pw = isAccepted
      ? Math.random().toString(36).slice(2) +
        Math.random().toString(36).toUpperCase().slice(2)
      : undefined;

    Object.assign(userData, {
      ...rest,
      ...(isAccepted ? { accepted: new Date() } : {}),
      ...(isExpelled ? { deleted: new Date() } : {}),
      ...(!!pw ? { password: await hashPassword(pw) } : {}),
    });

    if (!!old && !(await ifMatched(old, userData.password)))
      throw new BadRequestException('Wrong old password');

    if (!!password) userData.password = await hashPassword(password);

    await this.userRepository.save(userData);

    if (isAccepted)
      await this.mailService.sendMail(
        userData.email,
        'You have been accepted',
        'acceptance-scholar',
        {
          email: userData.email,
          password: pw,
        },
      );

    if (isExpelled)
      await this.mailService.sendMail(
        userData.email,
        'You have been expelled',
        'expelled',
        {},
      );

    return;
  }
}
