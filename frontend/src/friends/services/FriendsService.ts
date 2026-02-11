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

    getFriendships(): Promise<FriendshipI[]> {
        return httpClient.get<FriendshipI[]>(`/friends`);
    }
}