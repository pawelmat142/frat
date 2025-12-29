export abstract class ChatUtil {
    public static chatRoom(chatId: number): string {
        return `chat:${chatId}`;
    }

    public static userRoom(uid: string): string {
        return `user:${uid}`;
    }
}