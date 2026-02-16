import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI";

export abstract class FriendUtil {

    public static getReceivedInvites(myUid: string, friendships: FriendshipI[]): FriendshipI[] {
        return friendships.filter(f => f.status === FriendshipStatuses.PENDING && f.addresseeUid === myUid);
    }
}