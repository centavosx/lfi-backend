import { TokenService } from '../services/token.service';
import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User, Token } from '../../decorators';
import { User as UserEntity } from '../../entities';

@ApiTags('Refresh')
@Controller()
export class RefreshController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('/refresh')
  public async refreshToken(
    @User() user: UserEntity | undefined,
    @Token() token: string | undefined,
  ) {
    if (!user) throw new UnauthorizedException('Unauthorized');
    const tokens = await this.tokenService.generateTokens(user);
    await this.tokenService.whitelistToken(tokens.refreshToken, user.id);
    try {
      await this.tokenService.unlistToken(token, user.id);
    } catch {}
    return tokens;
  }
}
