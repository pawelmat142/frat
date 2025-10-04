/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { RegisterFormDto, RegisterFormResponse } from '@shared/dto/AuthDto';
import { AuthValidators } from '@shared/validators/AuthValidator';
import { ToastException } from 'global/exceptions/ToastException';
import { FirebaseConfig } from '../../config/FirebaseConfig';

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
    this.logger.log('registerForm', dto);

    const validationErrorKey = AuthValidators.validateRegisterForm(dto);
    if (validationErrorKey) {
      throw new ToastException(validationErrorKey, this);
    }

    // Registration logic with Firebase Auth
    try {
      const userRecord = await this.firebaseAuth.createUser({
        email: dto.email,
        password: dto.password,
      });

      this.logger.log('Firebase user created', userRecord.uid);

      return {
        success: true,
        message: 'validation.success',
      };
    } catch (err: any) {
      throw new ToastException('validation.firebaseError', this);
    }
  }
}
