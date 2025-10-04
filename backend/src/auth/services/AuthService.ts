/** Created by Pawel Malek **/
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { LoginFormDto, LoginFormResponse, RegisterFormDto, RegisterFormResponse } from '@shared/dto/AuthDto';
import { AuthValidators } from '@shared/validators/AuthValidator';
import { ToastException } from 'global/exceptions/ToastException';
import { FirebaseConfig } from './FirebaseConfig';
import { UserRecord } from 'firebase-admin/auth';
import { PopupException } from 'global/exceptions/PopupException';
import { EmailService } from 'email/EmailService';
import { UserService } from 'user/services/UserService';
import { Util } from '@shared/utils/util';
import { UserProviders } from '@shared/interfaces/UserI';
import { Subscription } from 'rxjs/internal/Subscription';

// TODO 
// czy moge z przegladarki pobrac jakis unikalny klucz/id/numer charakterystyczny dla urzadzenia?
@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {

  private readonly logger = new Logger(this.constructor.name);

  private readonly subscription = new Subscription();

  constructor(
    private readonly firebaseConfig: FirebaseConfig,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) { }

  private get firebaseAuth() {
    return this.firebaseConfig.admin.auth();
  }

  private startSubscription() {
    this.subscription.add(
      this.userService.userDeletedEvent.subscribe(async (user) => {
        try {
          await this.deleteFirebaseUser(user.uid);
          this.logger.log(`Firebase user with UID: ${user.uid} deleted successfully`);
        } catch (error) {
          this.logger.error(`Error deleting Firebase user with UID: ${user.uid}`, error);
        }
      })
    );
  }

  onModuleInit() {
    this.startSubscription();
  }

  onModuleDestroy() {
    this.subscription.unsubscribe();
  }
  
  private async deleteFirebaseUser(uid: string): Promise<void> {
    await this.firebaseAuth.deleteUser(uid);
    this.logger.log(`Firebase user with UID: ${uid} deleted successfully`);
  }

  public async loginForm(dto: LoginFormDto): Promise<LoginFormResponse> {
    throw new ToastException('Method not implemented.', this);
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

      await this.sendVerificationEmail(dto, userRecord.uid);

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

  private async sendVerificationEmail(dto: RegisterFormDto, uid: string): Promise<void> {
    // Generate email verification link
    try {
      const verificationLink = await this.firebaseAuth.generateEmailVerificationLink(dto.email);
      await this.emailService.sendVerificationEmail(dto.email, verificationLink);
      this.logger.log('Verification email sent to user');
    } catch (emailError: any) {
      this.logger.error('Error sending verification email', emailError);
      await this.deleteFirebaseUser(uid);
    }
    
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
      await this.deleteFirebaseUser(userRecord.uid);
    }
  }

}