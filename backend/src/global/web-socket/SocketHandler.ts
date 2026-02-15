/** Created by Pawel Malek **/
import { AuthenticatedSocket } from './AuthenticatedSocket';

/**
 * Interface for feature-specific socket event handlers.
 * Each feature module (chat, friends, etc.) implements this to register
 * its own socket event logic on the shared gateway.
 */
export interface SocketHandler {
  /** Called when an authenticated user connects — use to join rooms, load state, etc. */
  onConnect(socket: AuthenticatedSocket): Promise<void>;

  /** Called when a user fully disconnects (no remaining sockets) */
  onFullDisconnect(uid: string): Promise<void>;
}
