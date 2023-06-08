import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserEntity } from '../entities';

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserEntity | undefined => {
    const request = ctx.switchToHttp().getRequest();

    return request?.user;
  },
);
