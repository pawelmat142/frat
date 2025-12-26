import { UserProvider } from "@shared/interfaces/UserI"

export interface CreateUser {
    uid: string
    displayName: string
    email?: string
    photoURL?: string
    telegramChannelId?: string
    provider: UserProvider
}
