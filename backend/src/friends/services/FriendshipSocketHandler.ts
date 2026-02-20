import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { SocketHandler } from "global/web-socket/SocketHandler";
import { SocketGateway } from "global/web-socket/SocketGateway";
import { AuthenticatedSocket } from "global/web-socket/AuthenticatedSocket";
import { FriendshipEvents, FriendshipI } from "@shared/interfaces/FriendshipI";
import { SocketUtil } from "@shared/utils/SocketUtil";

@Injectable()
export class FriendshipSocketHandler implements SocketHandler, OnModuleInit {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly socketGateway: SocketGateway,
  ) { }

  onModuleInit(): void {
    this.socketGateway.registerHandler(this);
  }

  onFullDisconnect(uid: string): Promise<void> {
    console.log('FriendshipSocketHandler onFullDisconnect', uid);
    return Promise.resolve();
  }

  async onConnect(socket: AuthenticatedSocket): Promise<void> {
    const uid = socket.user.uid;
    if (!uid) {
      throw new Error('Authenticated socket missing user UID');
    }
    socket.join(SocketUtil.userRoom(uid));
  }

  notifyInviteReceived(friendship: FriendshipI): void {
    this.socketGateway.emitToUser(friendship.addresseeUid, FriendshipEvents.INVITE_RECEIVED, friendship)
  }

  notifyInviteRejected(friendship: FriendshipI): void {
    this.socketGateway.emitToUser(friendship.requesterUid, FriendshipEvents.INVITE_REJECTED, friendship)
    this.socketGateway.emitToUser(friendship.addresseeUid , FriendshipEvents.INVITE_REJECTED, friendship)
  }

  notifyInviteAccepted(friendship: FriendshipI): void {
    this.socketGateway.emitToUser(friendship.requesterUid, FriendshipEvents.INVITE_ACCEPTED, friendship)
    this.socketGateway.emitToUser(friendship.addresseeUid, FriendshipEvents.INVITE_ACCEPTED, friendship)
  }

  notifyFriendRemoved(friendship: FriendshipI, removedFriendshipId: number): void {
    this.socketGateway.emitToUser(friendship.requesterUid, FriendshipEvents.FRIEND_REMOVED, removedFriendshipId)
    this.socketGateway.emitToUser(friendship.addresseeUid, FriendshipEvents.FRIEND_REMOVED, removedFriendshipId)
  }
  
}