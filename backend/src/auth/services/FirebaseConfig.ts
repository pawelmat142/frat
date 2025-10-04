import * as admin from 'firebase-admin';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseConfig {
  private readonly logger = new Logger(FirebaseConfig.name);

  constructor(private configService: ConfigService) {
    this.validateConfig();
    if (!admin.apps.length) {
      const serviceAccount = this.getServiceAccount();
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  get projectId(): string {
    return this.configService.get<string>('FIREBASE_PROJECT_ID', '');
  }

  get privateKey(): string {
    return this.configService.get<string>('FIREBASE_PRIVATE_KEY', '')?.replace(/\\n/g, '\n');
  }

  get clientEmail(): string {
    return this.configService.get<string>('FIREBASE_CLIENT_EMAIL', '');
  }

  private validateConfig(): void {
    const required = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
    ];

    const missing = required.filter(
      (key) => !this.configService.get<string>(key),
    );

    if (missing.length > 0) {
      this.logger.error(
        `Missing Firebase configuration: ${missing.join(', ')}. Firebase will be disabled.`,
      );
    } else {
      this.logger.log('Firebase configuration loaded successfully.');
    }
  }

  getServiceAccount(): ServiceAccount {
    const result = {
      projectId: this.projectId,
      privateKey: this.privateKey,
      clientEmail: this.clientEmail,
    };
    return result;
  }

  get admin() {
    return admin;
  }
}
