import { UserI, UserProviders } from "@shared/interfaces/UserI";

export abstract class UserUtil {
    public static getContactInfoLine = (user: UserI): string => {
        switch (user.provider) {
            case UserProviders.EMAIL:
            case UserProviders.GOOGLE:
                if (!user.email) {
                    throw new Error('Email is required for EMAIL and GOOGLE providers');
                }
                return user.email!;
            case UserProviders.TELEGRAM:
                if (!user.telegramUsername) {
                    throw new Error('Telegram username is required for Telegram provider');
                }
                return user.telegramUsername!;
            default: throw new Error('Unknown provider');
        }
    }
}