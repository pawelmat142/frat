import { UserI } from '@shared/interfaces/UserI';
import { ServiceProvider } from './services.provider';
import { Wizard, WizardStep } from './wizard';
import { ProfileWizard } from './ProfileWizard';

export class NewUserWizard extends Wizard {
  constructor(chatId: number, telegramUsername: string,services: ServiceProvider) {
    super(chatId, telegramUsername, services);
    this.user.telegramChannelId = chatId.toString();
  }

  private user: Partial<UserI> = {};

  private error: string;

  readonly STEP = {
    START: 0,
    ASK_NAME: 1,
    CREATED: 2,
    ERROR: 3,
    CONFIRM: 4,
  } 
  public getSteps(): WizardStep[] {
    return [
      {
        order: this.STEP.START,
        message: [
          `Welcome to FRAT!`,
          `Tap the button if you want to create an account!`,
        ],
        buttons: [
          [{
            text: `Register`,
            process: async () => this.STEP.ASK_NAME,
          }],
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
        order: this.STEP.CREATED,
        message: [`Profile created successfully!`,
           `You can sign in using the button below!`],
        buttons: [
          [{
            text: `Sign in`,
            switch: ProfileWizard.name
          }],
        ],
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
              process: () => this.createProfile(),
            },
          ],
        ],
      }
    ];
  }

  private async createProfile(): Promise<number> {
    try {
      const firebaseUser = await this.services.exportedAuthService.registerByTelegram(this.user.telegramChannelId);
      const user = await this.services.telegramUserService.createProfile({
        firebaseUser,
        telegramChannelId: this.user.telegramChannelId!,
        telegramUsername: this.telegramUsername!,
        displayName: this.user.displayName!,
      });
      return this.STEP.CREATED;
    } catch (error) {
      this.error = `${error}`;
      this.logger.warn(error);
      return this.STEP.ERROR;
    }
  }
}
