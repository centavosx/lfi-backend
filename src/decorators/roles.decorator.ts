import { SetMetadata } from '@nestjs/common';
import { Roles as RoleType } from '../enum';

export const Roles = (...roles: RoleType[] | 'all'[]) =>
  SetMetadata('roles', roles);
