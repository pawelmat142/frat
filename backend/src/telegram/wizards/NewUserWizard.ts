import { UserI } from '@shared/interfaces/UserI';
import { ServiceProvider } from './services.provider';
import { Wizard, WizardStep } from './wizard';

export class NewUserWizard extends Wizard {
  constructor(chatId: number, services: ServiceProvider) {
    super(chatId, services);
    this.user.telegramChannelId = chatId.toString();
  }

  private user: Partial<UserI> = {};

  private error: string;

  readonly STEP = {
    START: 0,
    ASK_NAME: 1,
    BYE: 2,
    ERROR: 3,
    CONFIRM: 4,
  }  
  // TODO translations
  public getSteps(): WizardStep[] {
    // const loginUrl = BotUtil.prepareLoginUrl();
    // if (!loginUrl) {
    //   return [BotUtil.swwStep()];
    // }
    return [
      {
        order: this.STEP.START,
        message: [
          `frat`,
          `Would you like to register?`,
        ],
        buttons: [
          [
            {
              text: 'No',
              process: async () => this.STEP.BYE,
            },
            {
              text: `Yes`,
              process: async () => this.STEP.ASK_NAME,
            },
          ],
        ],
      },
      {
        order: this.STEP.ASK_NAME,
        message: ['Provide your name...'],
        process: async (input: string) => {
          if (!input) {
            this.error = `Empty...`;
            return this.STEP.ASK_NAME;
          }
          this.user.displayName = input;
          return this.STEP.CONFIRM;
        },
      },
      {
        order: this.STEP.BYE,
        message: [`Bye`],
        close: true,
      },
      {
        order: this.STEP.ERROR,
        message: [this.error],
        close: true,
      },
      {
        order: this.STEP.CONFIRM,
        message: [
          `Profile with name ${
            this.user.displayName
          } will be created`,
        ],
        buttons: [
          [
            {
              text: 'Cancel',
              process: async () => this.STEP.START,
            },
            {
              text: 'Confirm',
              process: async () => this.createProfile(),
            },
          ],
        ],
      }
    ];
  }

  private async createProfile(): Promise<number> {
    try {
      const firebaseUser = await this.services.exportedAuthService.registerByTelegram(this.user.telegramChannelId);
      const user = await this.services.telegramUserService.createProfile(firebaseUser, this.user.telegramChannelId, this.user.displayName);
      return this.STEP.BYE;
    } catch (error) {
      this.error = error;
      this.logger.warn(error);
      return this.STEP.ERROR;
    }
  }
}
