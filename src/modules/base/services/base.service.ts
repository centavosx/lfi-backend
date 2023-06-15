import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileTypes, Role, User, UserFiles } from '../../../entities';
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
  UserInformationDto,
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
import { NewUser, RealTimeNotifications } from '../../../firebaseapp';

@Injectable()
export class BaseService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserFiles)
    private readonly fileRepository: Repository<UserFiles>,

    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
  ) {}

  private getFileTypeEnum(file: string): FileTypes | undefined {
    switch (file) {
      case 'idPic':
        return FileTypes.ID_PIC;
      case 'ncae':
        return FileTypes.NCAE;
      case 'certificate':
        return FileTypes.CERT;
      case 'pantawid':
        return FileTypes.PANTAWID;
      case 'gradeSlip':
        return FileTypes.GRADE_SLIP;
      case 'birthCert':
        return FileTypes.BIRTH_CERT;
      case 'autobiography':
        return FileTypes.BIO;
      case 'homeSketch':
        return FileTypes.HOME_SKETCH;
      case 'waterBill':
        return FileTypes.WATER_BILL;
      case 'electricBill':
        return FileTypes.ELECTRIC_BILL;
      case 'wifiBill':
        return FileTypes.WIFI_BILL;
      case 'enrollmentBill':
        return FileTypes.ENROLLMENT_BILL;
      default:
        return undefined;
    }
  }

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

  public async addUser(
    data: User,
    roles: Role[],
    isVerification?: boolean,
    uData?: UserInformationDto,
  ) {
    const info = !!uData ? uData : data;

    const extractFiles: UserFiles[] = Object.keys(info)
      .filter((v) => {
        const isTrue = !!this.getFileTypeEnum(v);

        return isTrue;
      })
      .map((v) => {
        const newFile = new UserFiles();
        newFile.link = info[v];
        newFile.type = this.getFileTypeEnum(v);
        if (!!uData) delete uData[v];
        else delete data[v];
        return newFile;
      });

    let user: User;
    const queryRunner = this.dataSource.createQueryRunner();
    const picture = uData.picture;

    delete uData.picture;

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const newUser = new User();

      const isAdmin = roles.every((v) => v.name !== Roles.USER);

      const pw =
        !isVerification &&
        (isAdmin || (!!uData && data.status === UserStatus.ACTIVE))
          ? Math.random().toString(36).slice(2) +
            Math.random().toString(36).toUpperCase().slice(2)
          : undefined;

      Object.assign(newUser, {
        ...data,
        password: !!pw ? await hashPassword(pw) : undefined,
        code: isVerification
          ? Math.random().toString(36).slice(2).toLowerCase()
          : undefined,
        ...(!!uData
          ? {
              ...uData,
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

      await this.userRepository.query(
        `
        DELETE FROM "user_files" WHERE user_id = $1
      `,
        [checkAndAddUser.id],
      );

      checkAndAddUser.roles = roles;

      await this.userRepository.save(checkAndAddUser);
      await this.fileRepository.save(
        extractFiles.map((v) => ({ ...v, user: checkAndAddUser })),
      );

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
        } else if (!!uData && data.status === UserStatus.ACTIVE && !isAdmin) {
          //new user
          const newUserFb = new NewUser(user.id);

          await newUserFb.setData({
            id: user.id,
            name: user.lname + ', ' + user.fname + ' ' + user.mname,
            picture,
          });

          await this.mailService.sendMail(
            user.email,
            'You have been accepted',
            'acceptance-scholar',
            {
              email: checkAndAddUser.email,
              password: pw,
            },
          );
          const notif = new RealTimeNotifications(user.id);
          await notif.sendData({
            title: 'Congratulations!',
            description:
              'You have been accepted to our scholarship program, please check your email for more details',
          });
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
    let uData;
    if ('userData' in data) {
      uData = data.userData;
      delete data.userData;
    }
    return await this.addUser(
      {
        ...dataToSave,
        ...data,
      } as any,
      role,
      isVerification,
      uData,
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

    console.log(email);

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
    if (user.status !== UserStatus.ACTIVE) throw new NotFoundException();
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
    const picture = rest.picture;

    delete rest.picture;

    const userData = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['files'],
    });

    if (!userData) throw new NotFoundException();

    const extractFiles: UserFiles[] = Object.keys(rest)
      .filter((v) => {
        const isTrue = !!this.getFileTypeEnum(v);
        return isTrue;
      })
      .map((v) => {
        const newFile = new UserFiles();
        newFile.link = rest[v];
        newFile.type = this.getFileTypeEnum(v);
        delete rest[v];
        return newFile;
      });

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
    const notif = new RealTimeNotifications(userData.id);

    const newUserFb = new NewUser(userData.id);

    await newUserFb.setData({
      id: user.id,
      name: user.lname + ', ' + user.fname + ' ' + user.mname,
      picture,
    });

    if (isAccepted) {
      await this.mailService.sendMail(
        userData.email,
        'You have been accepted',
        'acceptance-scholar',
        {
          email: userData.email,
          password: pw,
        },
      );

      await notif.sendData({
        title: 'Congratulations!',
        description:
          'You have been accepted to our scholarship program, please check your email for more details',
      });
    }

    if (isExpelled) {
      await this.mailService.sendMail(
        userData.email,
        'You have been expelled',
        'expelled',
        {},
      );

      await notif.sendData({
        title: 'You have been expelled',
        description:
          "I'm sorry to say this but we decided to expell you due to the requirement has not been met or violations.",
      });
    }

    return;
  }
}
