/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { RegisterFormDto, RegisterFormResponse } from '@shared/dto/AuthDto';
import { AuthValidators } from '@shared/validators/AuthValidator';
import { ToastException } from 'global/exceptions/ToastException';
import { FirebaseConfig } from './FirebaseConfig';
import { UserRecord } from 'firebase-admin/auth';
import { PopupException } from 'global/exceptions/PopupException';
import { EmailService } from 'email/EmailService';
import { UserService } from 'user/services/UserService';
import { Util } from '@shared/utils/util';
import { UserProviders } from '@shared/interfaces/UserI';

// TODO 
// czy moge z przegladarki pobrac jakis unikalny klucz/id/numer charakterystyczny dla urzadzenia?
@Injectable()
export class AuthService {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly firebaseConfig: FirebaseConfig,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) { }

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

      this.logger.log('Firebase user created', JSON.stringify(userRecord, null, 2))

      await this.sendVerificationEmail(dto)

      await this.createUserEntity(userRecord, dto)

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
      throw new ToastException('validation.firebaseError', this);
    }
  }

  private async sendVerificationEmail(dto: RegisterFormDto): Promise<void> {
    // Generate email verification link
    try {
      const verificationLink = await this.firebaseAuth.generateEmailVerificationLink(dto.email);
      await this.emailService.sendVerificationEmail(dto.email, verificationLink);
    } catch (emailError: any) {
      this.logger.error('Error sending verification email', emailError);

      // TODO delete firebase user 
      throw new Error();
    }

    this.logger.log('Verification email sent to user');
  }

  private async createUserEntity(userRecord: UserRecord, dto: RegisterFormDto): Promise<void> {
    try {
      await this.userService.create({
        uid: userRecord.uid,
        displayName: userRecord.displayName || Util.trimEmail(dto.email),
        email: dto.email,
        provider: UserProviders.EMAIL
      });
    } catch (error) {
      this.logger.error('Error creating user entity', error);

      // TODO delete firebase user
      throw new Error();
    }
  }

}