import { FriendshipI } from "@shared/interfaces/FriendshipI";
import { UserSearchResponse } from "@shared/interfaces/UserI";
import { httpClient } from "global/services/http";

export const FriendsService = {

    searchUsers(query: string, skip: number, limit: number): Promise<UserSearchResponse> {
        return httpClient.get<UserSearchResponse>(`/user/search?query=${query}&skip=${skip}&limit=${limit}`);
    },

    sendInvite(addresseeUid: string): Promise<FriendshipI> {
        return httpClient.post<FriendshipI>(`/friends/invite/${addresseeUid}`);
    },

    acceptInvite(friendshipId: number): Promise<FriendshipI> {
        return httpClient.patch<FriendshipI>(`/friends/accept/${friendshipId}`);
    },

    rejectInvite(friendshipId: number): Promise<FriendshipI> {
        return httpClient.patch<FriendshipI>(`/friends/reject/${friendshipId}`);
    },

    removeFriend(friendshipId: number): Promise<void> {
        return httpClient.delete(`/friends/${friendshipId}`);
    },

    getFriendships(uid: string): Promise<FriendshipI[]> {
        return httpClient.get<FriendshipI[]>(`/friends/${uid}`);
    }
}