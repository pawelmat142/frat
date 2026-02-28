import { ChatI, ChatWithMembers } from "./ChatI";
import { FriendshipI } from "./FriendshipI";
import { NotificationI } from "./NotificationI";
import { OfferI } from "./OfferI";
import { SettingsI } from "./SettingsI";
import { UserI } from "./UserI";
import { WorkerI } from "./WorkerProfileI";

export interface UserContext {
    user: UserI
    friendships: FriendshipI[]
    offers: OfferI[]
    workerProfile?: WorkerI
}

export interface MeUserContext extends UserContext {
    settings: SettingsI
    notifications: NotificationI[]
    chats: ChatWithMembers[]
}