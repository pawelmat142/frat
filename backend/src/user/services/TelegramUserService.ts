import { Injectable, Logger } from "@nestjs/common";
import { UserRepo } from "./UserRepo";
import { UserI, UserProviders } from "@shared/interfaces/UserI";
import { UserRecord } from "firebase-admin/auth";
import { UserService } from "./UserService";

export interface CreateTelegramUser {
  firebaseUser: UserRecord;
  telegramChannelId: string;
  telegramUsername: string;
  displayName: string;
}

@Injectable()
export class TelegramUserService {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly userRepo: UserRepo,
    private readonly userService: UserService,
  ) { }

  public async findUser(telegramChannelId: string): Promise<any> {
    return this.userRepo.getByTelegramChannelId(telegramChannelId);
  }

  public async createProfile(createTelegramUser: CreateTelegramUser): Promise<UserI> {
    const { firebaseUser, telegramChannelId, telegramUsername, displayName } = createTelegramUser;
    if (!telegramChannelId) {
      throw new Error('Telegram Channel ID is required to create profile');
    }
    if (!displayName) {
      throw new Error('Display Name is required to create profile');
    }
    const existsingUser = await this.userRepo.getByTelegramChannelId(telegramChannelId);
    if (existsingUser) {
      throw new Error(`User with Telegram Channel ID ${telegramChannelId} already exists`);
    }

    const user = await this.userRepo.create({
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      telegramChannelId,
      telegramUsername: `@${telegramUsername}`,
      displayName,
      provider: UserProviders.TELEGRAM,
    })
    this.logger.log(`Created new user with Telegram Channel ID: ${telegramChannelId}`);
    return user;
  }

  public async deleteByTelegram(user: UserI): Promise<void> {
    await this.userService.deleteUser(user.uid);
  }
}