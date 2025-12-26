import { UserI } from '@shared/interfaces/UserI';
import { ServiceProvider } from './services.provider';
import { Wizard, WizardStep } from './wizard';

export class ProfileWizard extends Wizard {
  protected user: UserI;

  constructor(profile: UserI, services: ServiceProvider) {
    super(Number(profile.telegramChannelId), services);
    this.user = profile;
  }

  private error: any;

  private readonly STEP = {
    START: 0,
    LOGIN: 1,
    ERROR: 2,
    DELETE: 3,
    DELETED: 4,
  }

  public getProfile(): UserI {
    return this.user;
  }

  public getSteps(): WizardStep[] {
    // const loginUrl = BotUtil.prepareLoginUrl();
    // if (!loginUrl) {
    //   return [BotUtil.swwStep()];
    // }

    const loginViewUrl = this.services.configService.get<string>('LOGIN_BY_TELEGRAM_URL');
    if (!loginViewUrl) {
      throw new Error('LOGIN_BY_TELEGRAM_URL is not defined');
    }
    return [
      {
        order: this.STEP.START,
        message: [
          `Welcome, ${this.user?.displayName}`,
        ],
        buttons: [
          [
            {
              text: 'Login page',
              process: async () => this.STEP.LOGIN,
            },
          ],
          [
            {
              text: 'Delete account',
              process: async () => this.STEP.DELETE,
            },
          ],
        ],
      },
      {
        order: this.STEP.ERROR,
        message: [this.error],
        close: true,
      },
      {
        order: this.STEP.LOGIN,
        message: ['Please use the link below to login:', loginViewUrl],
        close: true,
      },
      {
        order: this.STEP.DELETE,
        message: [`Are you sure?`],
        buttons: [
          [
            {
              text: `No`,
              process: async () => this.STEP.START,
            },
            {
              text: `Yes`,
              process: () => this.deleteAccount(),
            },
          ],
        ],
      },
      {
        order: this.STEP.DELETED,
        message: [`Your profile deleted successfully`],
        close: true,
      },
    ];
  }

  private async deleteAccount() {
    try {
      // TODO
      // await this.services.telegramUserService.deleteByTelegram(this.user);
      return this.STEP.DELETED;
    } catch (error) {
      this.error = error;
      this.logger.error(error);
      return 2;
    }
  }
}
