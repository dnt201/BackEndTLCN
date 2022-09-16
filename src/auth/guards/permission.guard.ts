import {
  CanActivate,
  ExecutionContext,
  mixin,
  Type,
  UnauthorizedException,
} from '@nestjs/common';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import JwtAuthenticationGuard from './jwt-authentication.guard';

export const PermissionGuard = (permission: string): Type<CanActivate> => {
  class PermissionGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      let request;
      try {
        request = context.switchToHttp().getRequest<RequestWithUser>();
      } catch (error) {
        throw new UnauthorizedException(`You mush log in to system`);
      }
      const user = request.user;

      return user?.permission && user?.permission.indexOf(permission) !== -1;
    }
  }

  return mixin(PermissionGuardMixin);
};
