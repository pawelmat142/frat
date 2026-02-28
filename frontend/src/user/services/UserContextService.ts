import { MeUserContext, UserContext } from "@shared/interfaces/UserContext";
import { httpClient } from "global/services/http";

export const UserContextService = {

    getMeUserContext(): Promise<MeUserContext> {
        return httpClient.get<MeUserContext>(`/user-ctx`);
    },

    getUserContext(uid: string): Promise<UserContext> {
        return httpClient.get<UserContext>(`/user-ctx/${uid}`);
    }
}