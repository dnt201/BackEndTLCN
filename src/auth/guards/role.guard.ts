import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';

import RequestWithUser from '../interfaces/requestWithUser.interface';
import JwtAuthenticationGuard from './jwt-authentication.guard';

export const RoleGuard = (roleDisplayName: string): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;
      return user?.role.toString() === roleDisplayName;
    }
  }

  return mixin(RoleGuardMixin);
};
