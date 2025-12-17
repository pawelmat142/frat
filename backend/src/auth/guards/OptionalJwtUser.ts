/** Created by Pawel Malek **/
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserI } from '@shared/interfaces/UserI';
import { ExportedAuthService } from 'auth/services/ExportedAuthService';
import { AuthUtil } from 'auth/services/AuthUtil';

@Injectable()
export class OptionalJwtUser implements CanActivate {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly exportedAuthService: ExportedAuthService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = AuthUtil.extractTokenFromHeader(request);

    if (!token) {
      request.user = null;
      request.firebaseToken = null;
      return true;
    }

    try {
      // Weryfikacja tokena Firebase
      const decodedToken: DecodedIdToken = await this.exportedAuthService.verifyIdToken(token);
      // Pobierz pełne dane usera z bazy (zawiera role, displayName, etc.)
      const user: UserI = await this.exportedAuthService.getOrCreateUserEntity(decodedToken);
      request.user = user || null;
      request.firebaseToken = decodedToken;
    } catch (error) {
      this.logger.warn('OptionalJwtAuthGuard: invalid or expired token, proceeding as guest');
      request.user = null;
      request.firebaseToken = null;
    }
    return true;
  }
}
