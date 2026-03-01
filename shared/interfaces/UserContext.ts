import {  ChatWithMembers } from "./ChatI";
import { FriendshipI } from "./FriendshipI";
import { NotificationI } from "./NotificationI";
import { OfferI } from "./OfferI";
import { SettingsI } from "./SettingsI";
import { UserI } from "./UserI";
import { WorkerWithCertificates } from "./WorkerProfileI";

export interface UserContext {
    user: UserI
    friendships: FriendshipI[]
    offers: OfferI[]
    workerProfile?: WorkerWithCertificates
}

export interface MeUserContext extends UserContext {
    settings: SettingsI
    notifications: NotificationI[]
    chats: ChatWithMembers[]
}