import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const Token = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();

    return request?.token;
  },
);
