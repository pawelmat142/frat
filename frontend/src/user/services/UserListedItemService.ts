import { AddUserListedItemDto, UserListedItem } from "@shared/interfaces/UserListedItem";
import { httpClient } from "global/services/http";

export const UserListedItemService = {

    addItem(dto: AddUserListedItemDto): Promise<UserListedItem> {
        return httpClient.post<UserListedItem>(`/user-listed`, dto);
    },

    removeItem(id: string): Promise<void> {
        return httpClient.delete<void>(`/user-listed/${id}`);
    }
}