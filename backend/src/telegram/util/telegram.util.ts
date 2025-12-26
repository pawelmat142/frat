import { LoginFormDto } from '@shared/dto/AuthDto';
import * as crypto from 'crypto';

export interface Credentials extends LoginFormDto {}

export abstract class TelegramUtil {
  public static idByTelegram(telegramChannelId: string): string {
    return `telegram_${telegramChannelId}`;
  }

  public static loginToken(): string {
    return crypto.randomUUID();
  }

  public static pin(): string {
    const pin = Math.floor(Math.random() * 10000); // Generates a number between 0 and 9999
    return pin.toString().padStart(4, '0'); // Pads with leading zeros if necessary
  }

  public static prepareCredentials(telegramChannelId: string, secretKey: string): Credentials {
    return {
      email: this.emailByTelegram(telegramChannelId),
      password: this.passwordByTelegram(telegramChannelId, secretKey),
    };
  }

  private static emailByTelegram(telegramChannelId: string): string {
    return `${telegramChannelId}@book-agency-telegram.com`;
  }

  private static passwordByTelegram(telegramChannelId: string, secretKey: string): string {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(telegramChannelId);
    const hash = hmac.digest('hex');
    return hash;
  }
}
