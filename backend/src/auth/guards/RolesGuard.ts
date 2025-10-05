/** Created by Pawel Malek **/
import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@shared/interfaces/UserI';
import { AuthValidators } from '@shared/validators/AuthValidator';
import { ROLES_KEY } from 'auth/decorators/RolesDecorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  private readonly logger = new Logger(this.constructor.name)

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jeśli nie ma wymaganych ról, przepuść request
    if (!requiredRoles) {
      return true;
    }

    const { user, url } = context.switchToHttp().getRequest();

    if (!user) {
      this.throwForbidden('User not authenticated', url);
    }

    // Sprawdź czy user ma przynajmniej jedną z wymaganych ról
    const hasRole = AuthValidators.hasPermission(requiredRoles, user);

    if (!hasRole) {
      this.throwForbidden('Insufficient permissions', url);
    }

    return true;
  }

  throwForbidden(msg: string, url: string) {
    this.logger.warn(`[${url}] ${msg}`);
    throw new ForbiddenException(msg);
  }
}
