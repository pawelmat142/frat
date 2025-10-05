/** Created by Pawel Malek **/
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@shared/interfaces/UserI';

export const ROLES_KEY = 'roles';

/**
 * Dekorator określający role wymagane do dostępu do endpointu
 * Użycie: @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
