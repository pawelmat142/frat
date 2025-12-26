import { UserI } from '@shared/interfaces/UserI';
import { ServiceProvider } from './services.provider';
import { Wizard, WizardStep } from './wizard';

export class ProfileWizard extends Wizard {
  protected user: UserI;

  constructor(profile: UserI, services: ServiceProvider) {
    super(Number(profile.telegramChannelId), services);
    this.user = profile;
  }

  pin?: string

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

  private processLoginStep = async () => {
    const newPin = this.services.exportedAuthService.generatePin(this.user.telegramChannelId!);
    this.pin = newPin.pin;
    this.logger.log(`Generated new login pin for user ${this.user.uid}: ${newPin.pin}`);
    return this.STEP.LOGIN
  }

  private getLoginViewUrl = (): string | null => {
    const loginViewUrl = this.services.configService.get<string>('LOGIN_BY_TELEGRAM_URL');
    if (!loginViewUrl) {
      return null;
    }
    return loginViewUrl;
  }

  private goToLoginPage = async (): Promise<number> => {
    return this.STEP.LOGIN;
  }

  public getSteps(): WizardStep[] {
    // const loginUrl = BotUtil.prepareLoginUrl();
    // if (!loginUrl) {
    //   return [BotUtil.swwStep()];
    // }

    const pin = this.services.exportedAuthService.getLoginPin(this.user.telegramChannelId!);
    const loginUrl = this.getLoginViewUrl();
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
              process: this.processLoginStep,
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
        order: this.STEP.LOGIN,
        message: [
          `PIN: ${pin ? pin.pin : this.pin}`,
        ],
        buttons: [[{
          text: `📋 Copy PIN`,
          copy_text: { text: pin?.pin || this.pin || '' },
        }], [{
          text: `🔄 New PIN`,
          process: this.processLoginStep,
        }], [{
          text: `🌐 Open login page`,
          url: loginUrl,
        }]]
      },
      {
        order: this.STEP.ERROR,
        message: [this.error],
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
