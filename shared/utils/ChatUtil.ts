export abstract class ChatUtil {
    public static chatRoom(chatId: number): string {
        return `chat:${chatId}`;
    }
}