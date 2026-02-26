import { Logger } from '@nestjs/common';
import { ServiceProvider } from './services.provider';
import { UserI } from '@shared/interfaces/UserI';

export interface WizardResponse {
  chatId: number;
  order?: number;
  message?: string[];
  buttons?: WizardButton[][];
}

export interface WizardStep {
  order: number;
  message?: string[];
  close?: boolean;
  switch?: string;
  buttons?: WizardButton[][];
  process?: (input: string) => Promise<number>;
  nextOrder?: number;
  backButton?: boolean;
}

export interface WizardButton {
  text: string;
  callback_data?: string;
  switch?: string;
  url?: string;
  copy_text?: { text: string };
  process?(): Promise<number>; //returns order of next step
}

export class Wizard {
  protected readonly logger = new Logger(Wizard.name);

  chatId: number;

  telegramUsername: string;

  order: number;

  modified: Date;

  msgId: number;

  constructor(chatId: number, telegramUsername: string, protected readonly services: ServiceProvider) {
    this.chatId = chatId;
    this.telegramUsername = telegramUsername;
    this.order = 0;
    this.modified = new Date();
  }

  protected getLoginViewUrl = (): string => {
    const loginViewUrl = this.services.configService.get<string>('LOGIN_BY_TELEGRAM_URL');
    if (!loginViewUrl) {
      throw new Error('LOGIN_BY_TELEGRAM_URL is not defined in environment variables');
    }
    return loginViewUrl;
  }

  public getSteps(): WizardStep[] {
    throw new Error('not implemented');
  }

  private initialized = false;

  public getStep(): WizardStep {
    const steps = this.getSteps();

    const orders = steps.map(s => s.order);
    if (!orders.includes(this.order)) {
      this.logger.error(`Invalid order: ${this.order}`);
      return steps[0];
    }
    const step = steps.find(s => s.order === this.order); 
    if (!step) {
      this.logger.error(`Step not found for order: ${this.order}`);
      return steps[0];
    }
    return step;
  }

  public init = async (user?: UserI) => {
    if (!this.initialized) {
      await this._init(user);
      this.initialized = true;
    }
  };

  protected _init = async (user?: UserI) => {};
}
