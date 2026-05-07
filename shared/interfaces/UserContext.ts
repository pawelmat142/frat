import {  ChatWithMembers } from "./ChatI";
import { FriendshipI } from "./FriendshipI";
import { NotificationI } from "./NotificationI";
import { OfferI } from "./OfferI";
import { SettingsI } from "./SettingsI";
import { TrainingProviderProfileI } from "./TrainingI";
import { UserI } from "./UserI";
import { UserListedItem } from "./UserListedItem";
import { WorkerWithCertificates } from "./WorkerI";

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
    listedItems?: UserListedItem[]

    trainingProvider?: TrainingProviderProfileI | null
    
    recentViewedWorkers?: UserListedItem[]
    recentViewedOffers?: UserListedItem[]
}