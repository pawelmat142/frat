/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { RegisterFormDto, RegisterFormResponse } from '@shared/dto/AuthDto';
import { AuthValidators } from '@shared/validators/AuthValidator';
import { ToastException } from 'global/exceptions/ToastException';
import { FirebaseConfig } from '../../config/FirebaseConfig';
import { UserRecord } from 'firebase-admin/auth';
import { PopupException } from 'global/exceptions/PopupException';

// TODO 
// czy moge z przegladarki pobrac jakis unikalny klucz/id/numer charakterystyczny dla urzadzenia?
@Injectable()
export class AuthService {

  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly firebaseConfig: FirebaseConfig) {}

  private get firebaseAuth() {
    return this.firebaseConfig.admin.auth();
  }

  public async registerForm(dto: RegisterFormDto): Promise<RegisterFormResponse> {
    const validationErrorKey = AuthValidators.validateRegisterForm(dto);
    if (validationErrorKey) {
      throw new ToastException(validationErrorKey, this);
    }

    // Registration logic with Firebase Auth
    try {
      const userRecord: UserRecord = await this.firebaseAuth.createUser({
        email: dto.email,
        password: dto.password,
      });

      this.logger.log('Firebase user created', JSON.stringify(userRecord, null, 2));

      return {
        success: true,
        message: 'validation.success',
      };
    } catch (err: any) {
      const firebaseErrorCode = err?.errorInfo?.code;
      if (firebaseErrorCode) {
        if (firebaseErrorCode === 'auth/email-already-exists') {
          throw new PopupException(`validation.firebaseError.emailInUse`, this)
        }
        this.logger.error(err);
      }
      // TODO obsluga email zajety itp
      throw new ToastException('validation.firebaseError', this);
    }
  }
}