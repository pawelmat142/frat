/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailConfig {
  private readonly logger = new Logger(EmailConfig.name);

  constructor(private configService: ConfigService) {
    this.validateConfig();
  }

  get serviceId(): string {
    return this.configService.get<string>('EMAILJS_SERVICE_ID', '');
  }

  get templateId(): string {
    return this.configService.get<string>('EMAILJS_TEMPLATE_ID', '');
  }

  get publicKey(): string {
    return this.configService.get<string>('EMAILJS_PUBLIC_KEY', '');
  }

  get privateKey(): string {
    return this.configService.get<string>('EMAILJS_PRIVATE_KEY', '');
  }

  get replyToEmail(): string {
    return this.configService.get<string>('EMAILJS_REPLY_TO_EMAIL', '');
  }

  private validateConfig(): void {
    const required = [
      'EMAILJS_SERVICE_ID',
      'EMAILJS_TEMPLATE_ID',
      'EMAILJS_PUBLIC_KEY',
      'EMAILJS_PRIVATE_KEY',
      'EMAILJS_REPLY_TO_EMAIL'
    ];

    const missing = required.filter(
      (key) => !this.configService.get<string>(key),
    );

    if (missing.length > 0) {
      this.logger.error(
        `Missing EmailJS configuration: ${missing.join(', ')}. Email sending will be disabled.`,
      );
    } else {
        this.logger.log('EmailJS configuration loaded successfully.');
    }
  }

  get isConfigured(): boolean {
    return !!(
      this.serviceId &&
      this.templateId &&
      this.publicKey &&
      this.privateKey &&
      this.replyToEmail
    );
  }
}
