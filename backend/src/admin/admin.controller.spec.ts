import 'reflect-metadata';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { AdminController } from './admin.controller';

describe('AdminController RBAC', () => {
  it('is restricted to admin role', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, AdminController);
    expect(roles).toEqual(['admin']);
  });
});
