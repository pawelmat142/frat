/** Created by Pawel Malek **/
import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { FirebaseConfig } from '../services/FirebaseConfig';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserService } from 'user/services/UserService';
import { UserI } from '@shared/interfaces/UserI';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly firebaseConfig: FirebaseConfig,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Weryfikacja tokena Firebase
      const decodedToken: DecodedIdToken = await this.firebaseConfig
        .admin
        .auth()
        .verifyIdToken(token);

      // Pobierz pełne dane usera z bazy (zawiera role, displayName, etc.)
      const user: UserI = await this.userService.getOrCreateUserEntity(decodedToken);

      if (!user) {
        throw new UnauthorizedException('User not found in database');
      }

      // Dodaj użytkownika do request - będzie dostępny w kontrolerach
      request.user = user;
      request.firebaseToken = decodedToken;

      return true;
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
