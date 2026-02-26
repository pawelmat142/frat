import { UserI } from '@shared/interfaces/UserI';
import { ServiceProvider } from './services.provider';
import { Wizard, WizardStep } from './wizard';

export class ProfileWizard extends Wizard {

  protected user: UserI;

  constructor(profile: UserI, services: ServiceProvider) {
    super(Number(profile.telegramChannelId), profile.telegramUsername, services);
    this.user = profile;
  }

  pin?: string

  private error: any;

  private readonly STEP = {
    LOGIN: 1,
    ERROR: 2,
    ENSURE: 3,
    DELETED: 4,
    STOP: 5,
  }

  override _init = async (user?: UserI) => {
    if (!this.user && user) {
      this.user = user;
    }
    this.processLoginStep()
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



  public getSteps(): WizardStep[] {
    const pin = this.services.exportedAuthService.getLoginPin(this.user.telegramChannelId!);
    return [
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
          process: () => this.processLoginStep(),
        }], [{
          text: `🌐 Open login page`,
          url: this.getLoginViewUrl(),
        }], [
          {
            text: 'Delete account',
            process: async () => this.STEP.ENSURE,
          },
        ],]
      },
      {
        order: this.STEP.ERROR,
        message: [this.error],
      },
      {
        order: this.STEP.ENSURE,
        message: [`Are you sure?`],
        buttons: [[{
          text: `No`,
          process: async () => this.STEP.LOGIN,
        }, {
          text: `Yes`,
          process: async () => this.deleteAccount(),
        }]],
      },
      {
        order: this.STEP.DELETED,
        message: [`Your profile deleted successfully`],
        buttons: [[{
          text: `OK`,
          process: async () => this.STEP.STOP,
        }]]
      },
      {
        order: this.STEP.STOP,
        message: [`Goodbye!`],
        close: true,
      }
    ];
  }

  private async deleteAccount() {
    try {
      await this.services.telegramUserService.deleteByTelegram(this.user);
      return this.STEP.DELETED;
    } catch (error) {
      this.error = error;
      this.logger.error(error);
      return this.STEP.ERROR;
    }
  }
}
