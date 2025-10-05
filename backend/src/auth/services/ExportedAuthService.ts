
/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { FirebaseConfig } from './FirebaseConfig';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserService } from 'user/services/UserService';
import { Util } from '@shared/utils/util';
import { UserI, UserStatuses } from '@shared/interfaces/UserI';
import { UserUtil } from 'user/UserUtil';

@Injectable()
export class ExportedAuthService {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly firebaseConfig: FirebaseConfig,
    private readonly userService: UserService,
  ) { }


  public async verifyIdToken(token: string): Promise<DecodedIdToken> {
    return await this.firebaseConfig
        .admin
        .auth()
        .verifyIdToken(token);
  }

  public async getOrCreateUserEntity(decodedToken: DecodedIdToken): Promise<UserI | null> {
    const existingUser = await this.userService.getUserByUid(decodedToken.uid);

    if (existingUser) {
      if (existingUser.status === UserStatuses.ACTIVE) {
        return existingUser;
      }
      this.logger.warn(`User with uid ${decodedToken.uid} is not active. Cannot create or return user.`);
      return null
    }

    const provider = UserUtil.findProvider(decodedToken);
    if (!provider) {
      this.logger.warn(`Cannot determine provider from decoded token for uid ${decodedToken.uid}`);
    }

    const newUser = await this.userService.create({
      uid: decodedToken.uid,
      displayName: decodedToken.name || Util.trimEmail(decodedToken.email),
      email: decodedToken.email,
      provider: provider,
      photoURL: decodedToken.picture,
    });
    return newUser;
  }

}