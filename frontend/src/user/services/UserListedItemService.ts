import { AddNoteDto, AddUserListedItemDto, ListedItemNote, UserListedItem } from "@shared/interfaces/UserListedItem";
import { httpClient } from "global/services/http";
import { remove } from "remove-accents";

export const UserListedItemService = {

    addItem(dto: AddUserListedItemDto): Promise<UserListedItem> {
        return httpClient.post<UserListedItem>(`/user-listed`, dto);
    },

    removeItem(id: string): Promise<void> {
        return httpClient.delete<void>(`/user-listed/${id}`);
    },

    addNote(dto: AddNoteDto): Promise<ListedItemNote> {
        return httpClient.post<ListedItemNote>(`/user-listed/add-note`, dto);
    },

    updateNote(dto: AddNoteDto): Promise<ListedItemNote> {
        return httpClient.post<ListedItemNote>(`/user-listed/update-note`, dto);
    },

    removeNote(itemId: string, noteId: string): Promise<void> {
        return httpClient.delete<void>(`/user-listed/${itemId}/note/${noteId}`);
    }
}