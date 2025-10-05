/** Created by Pawel Malek **/
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserI } from '@shared/interfaces/UserI';

/**
 * Dekorator do pobrania aktualnie zalogowanego użytkownika
 * Użycie: @CurrentUser() user: UserI
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserI => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
