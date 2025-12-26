
/** Created by Pawel Malek **/
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RegisterFormDto } from '@shared/dto/AuthDto';
import { AuthValidators } from '@shared/validators/AuthValidator';
import { ToastException } from 'global/exceptions/ToastException';
import { FirebaseConfig } from './FirebaseConfig';
import { UserRecord } from 'firebase-admin/auth';
import { PopupException } from 'global/exceptions/PopupException';
import { EmailService } from 'email/EmailService';
import { UserService } from 'user/services/UserService';
import { Util } from '@shared/utils/util';
import { UserProviders, UserProvider } from '@shared/interfaces/UserI';
import { Subscription } from 'rxjs/internal/Subscription';
import { SWWException } from 'global/exceptions/SWWException';
import { UserEntity } from 'user/model/UserEntity';

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

  onModuleInit() {
    this.startSubscription();
  }

  onModuleDestroy() {
    this.subscription.unsubscribe();
  }

  public async registerFormFirebaseUserCreate(dto: { email: string; password: string }): Promise<UserRecord> {
    const userRecord: UserRecord = await this.firebaseAuth.createUser({
      email: dto.email,
      password: dto.password,
    });

    this.logger.log('Firebase user created', JSON.stringify(userRecord, null, 2))
    return userRecord;
  }

  public async registerForm(dto: RegisterFormDto): Promise<void> {
    const validationErrorKey = AuthValidators.validateRegisterForm(dto);
    if (validationErrorKey) {
      throw new ToastException(validationErrorKey, this);
    }

    try {
      const userRecord: UserRecord = await this.registerFormFirebaseUserCreate({
        email: dto.email,
        password: dto.password,
      });

      await this.sendVerificationEmail(dto.email, userRecord.uid);

      const entity = await this.createUserEntityByRegisterForm(userRecord, dto.email)

    } catch (err: any) {
      this.handleRegisterError(err);
    }
  }

  private handleRegisterError(err: any): void {
    try {
      const msg = AuthValidators.handleFireAuthError(err);
      if (msg) {
        throw new PopupException(msg, this)
      }
    } catch (error) {
      throw new SWWException(error, this);
    }
  }

  private async createUserEntityByRegisterForm(userRecord: UserRecord, email: string): Promise<UserEntity> {
    return this.createUserEntity(userRecord, email, UserProviders.EMAIL);
  }

  private async createUserEntity(userRecord: UserRecord, email: string, provider: UserProvider, displayName?: string): Promise<UserEntity> {
    try {
      const entity: UserEntity = await this.userService.create({
        uid: userRecord.uid,
        displayName: displayName || userRecord.displayName || Util.trimEmail(email),
        email: email,
        provider: provider
      });
      return entity;
    } catch (error) {
      this.logger.error('Error creating user entity', error);
      await this.deleteFirebaseUser(userRecord.uid);
    }
  }

  public async sendVerificationEmail(email: string, uid: string): Promise<void> {
    // Generate email verification link
    try {
      const verificationLink = await this.firebaseAuth.generateEmailVerificationLink(email);
      await this.emailService.sendVerificationEmail(email, verificationLink);
      this.logger.log('Verification email sent to user');
    } catch (emailError: any) {
      this.logger.error('Error sending verification email', emailError);
      await this.deleteFirebaseUser(uid);
    }
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.userService.findUserByEmail(email);

    if (user?.provider !== UserProviders.EMAIL) {
      throw new ToastException('authError.passwordResetNotAvailable', this);
    }
    try {
      const verificationLink = await this.firebaseAuth.generatePasswordResetLink(user.email);
      await this.emailService.sendPasswordResetEmail(user.email, verificationLink);
      this.logger.log('Password reset email sent to user');
    } catch (error) {
      this.logger.error(error);
      throw new ToastException('authError.passwordResetNotError', this);
    }
  }

  private startSubscription() {
    this.subscription.add(
      this.userService.userDeletedEvent.subscribe(async (user) => {
        try {
          await this.deleteFirebaseUser(user.uid);
        } catch (error) {
          this.logger.error(`Error deleting Firebase user with UID: ${user.uid}`, error);
        }
      })
    );
  }

  private async deleteFirebaseUser(uid: string): Promise<void> {
    await this.firebaseAuth.deleteUser(uid);
    this.logger.log(`Firebase user with UID: ${uid} deleted successfully`);
  }

}