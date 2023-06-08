import * as jwt from 'jsonwebtoken';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Token, User } from '../../entities';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  public async createAccessToken(data: User) {
    return jwt.sign({ ...data }, process.env.ACCESS_KEY as string, {
      expiresIn: '24h',
    });
  }

  public async createRefreshToken(data: User, time?: string) {
    return jwt.sign({ ...data }, process.env.REFRESH_KEY as string, {
      expiresIn: time ?? '168h',
    });
  }

  public async verifyToken(token: string, isRefresh: boolean) {
    try {
      const decoded = jwt.verify(
        token,
        (isRefresh
          ? process.env.REFRESH_KEY
          : process.env.ACCESS_KEY) as string,
      );
      return decoded as User;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  public async whitelistToken(token: string, id: string) {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const newToken = new Token();
    newToken.tokenId = token;
    newToken.exp = date;
    newToken.userId = id;
    return await this.tokenRepository.save(newToken);
  }

  public async unlistToken(token: string, userId: string) {
    return await this.tokenRepository.delete({
      tokenId: token,
      userId: userId,
    });
  }

  public async unlistUserIds(ids: string[]) {
    return await this.tokenRepository
      .createQueryBuilder('token')
      .leftJoin('token.user', 'user')
      .where(`user.id IN (:...ids)`, { ids })
      .delete()
      .execute();
  }

  public async ifWhiteListed(token: string, userId: string) {
    try {
      const verify = await this.tokenRepository.findOneOrFail({
        where: {
          userId,
          tokenId: token,
        },
      });

      const date = new Date();
      if (verify.exp > date) return true;
      await this.unlistToken(token, userId);
      return false;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }

  public async generateTokens(data: User) {
    delete data.password;
    return {
      accessToken: await this.createAccessToken(data),
      refreshToken: await this.createRefreshToken(data),
    };
  }

  public async generateResetToken(data: User) {
    delete data.password;
    return await this.createRefreshToken(data, '15m');
  }
}
