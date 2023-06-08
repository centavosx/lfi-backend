import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '../entities';
import { Roles } from '../enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Roles[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();

    const user = req.user as User;
    if (!user) throw new UnauthorizedException('Unauthorized');

    for (const x of roles) {
      if (!!user.roles)
        for (const u of user?.roles) {
          if (u.name === x) return true;
        }
    }

    return false;
  }
}
