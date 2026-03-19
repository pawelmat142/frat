import { Injectable } from "@nestjs/common";
import { MeUserContext, UserContext } from "@shared/interfaces/UserContext";
import { UserI } from "@shared/interfaces/UserI";
import { ChatService } from "chat/services/ChatService";
import { WorkersService } from "employee/services/WorkerService";
import { FriendshipService } from "friends/services/FriendshipService";
import { NotificationService } from "notification/services/NotificationService";
import { OffersService } from "offer/services/OffersService";
import { UserService } from "user/services/UserService";
import { SettingsService } from "user/settings-module/services/SettingsService";

@Injectable()
export class UserContextService {
    constructor(
        private readonly userService: UserService,
        private readonly friendshipService: FriendshipService,
        private readonly offersService: OffersService,
        private readonly workersService: WorkersService,
        private readonly settingsService: SettingsService,
        private readonly notificationService: NotificationService,
        private readonly chatService: ChatService,
    ) { }

    public async getUserContext(user: UserI, uid: string): Promise<UserContext> {

        const friendships = await this.friendshipService.getFriendships(uid);
        const offers = await this.offersService.listOffersByUid(uid);
        const workerProfile = await this.workersService.getWorkerWithCertificates(user);

        const ctx: UserContext = {
            user,
            friendships,
            offers,
            workerProfile,
        }

        return ctx;
    }

    public async getMeUserContext(user: UserI): Promise<MeUserContext> {
        const ctx = await this.getUserContext(user, user.uid);

        const settings = await this.settingsService.getSettings(user.uid);
        const notifications = await this.notificationService.getUserNotifications(user.uid);
        const chats = await this.chatService.getUserChats(user.uid);

        const meCtx: MeUserContext = {
            ...ctx,
            settings,
            notifications,
            chats,
        }
        await this.userService.updateLastSeenAt(user.uid);
        return meCtx;
    }
}