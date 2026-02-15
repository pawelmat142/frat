/** General socket room utilities shared across features */
export abstract class SocketUtil {
    /** Personal room for direct notifications to a user */
    public static userRoom(uid: string): string {
        return `user:${uid}`;
    }
}
