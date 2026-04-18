import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type AppRole = 'partner_user' | 'admin';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
