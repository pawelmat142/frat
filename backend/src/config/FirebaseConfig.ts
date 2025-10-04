import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseConfig {
  constructor(private configService: ConfigService) {
    if (!admin.apps.length) {
      const serviceAccount = this.getServiceAccount();
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  getServiceAccount(): ServiceAccount {
    const result = {
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
    };
    return result
  }

  get admin() {
    return admin;
  }
}
