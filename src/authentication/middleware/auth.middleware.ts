import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response, NextFunction } from 'express';
import { User } from '../../entities';
import { Repository } from 'typeorm';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async use(req: Request & { user: User }, _: Response, next: NextFunction) {
    const auth = req.headers['authorization']?.split(' ');

    if (!!auth && auth[0] === 'Bearer') {
      const token = auth[1];
      const userFromToken = await this.tokenService.verifyToken(token, false);

      const user = await this.userRepository.findOne({
        where: { id: userFromToken.id },
        relations: ['roles'],
      });

      if (!user) throw new UnauthorizedException('Unauthorized');
      req.user = user;
    }
    return next();
  }
}

@Injectable()
export class RefreshMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async use(
    req: Request & { user: User; token: string },
    _: Response,
    next: NextFunction,
  ) {
    const auth = req.headers['authorization']?.split(' ');

    if (!!auth && auth[0] === 'Bearer') {
      const token = auth[1];
      const userFromToken = await this.tokenService.verifyToken(token, true);
      const isListed = await this.tokenService.ifWhiteListed(
        token,
        userFromToken.id,
      );
      if (!isListed) throw new UnauthorizedException('Unauthorized');

      const user = await this.userRepository.findOne({
        where: { id: userFromToken.id },
        relations: ['roles'],
      });

      if (!user) throw new UnauthorizedException('Unauthorized');

      req.user = user;
      req.token = token;
    }

    return next();
  }
}
