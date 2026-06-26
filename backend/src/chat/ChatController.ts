/** Created by Pawel Malek **/
import { Body, Controller, Get, Post, Put, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { ChatService } from './services/ChatService';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { UserI } from '@shared/interfaces/UserI';
import { ChatSocketHandler } from './services/ChatSocketHandler';
import { ChatI, ChatWithMembers } from '@shared/interfaces/ChatI';
import { ApiResponse } from '@shared/dto/dtos';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {

  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatSocketHandler,
  ) { }

  /**
   * Get or create a direct chat with another user
   */
  @Post('direct/:recipientUid')
  async getOrCreateDirectChat(
    @CurrentUser() user: UserI,
    @Param('recipientUid') recipientUid: string,
  ): Promise<ChatI> {
    const chat = await this.chatService.getOrCreateDirectChat(user.uid, recipientUid);

    // Notify recipient about new chat via WebSocket
    this.chatGateway.notifyUserAboutNewChat(recipientUid, chat);

    return chat;
  }

  /**
   * Get single chat by ID
   */
  @Get(':chatId')
  getChatById(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: number,
  ): Promise<ChatWithMembers> {
    return this.chatService.getChatWithMembersWithUsers(chatId, user.uid);
  }

  /**
   * Get messages for a chat
   */
  @Get(':chatId/messages')
  getChatMessages(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatService.getChatMessages(
      chatId,
      user.uid,
      limit || 50,
      offset || 0,
    );
  }

  /**
   * Clean chat history
   */
  @Delete(':chatId/messages/clean')
  async cleanChat(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: string,
  ): Promise<ChatI> {
    const result = await this.chatService.cleanChat(user.uid, Number(chatId));
    this.chatGateway.notifyAboutRefreshChat(result);
    return result;
  }

  /**
   * Clean chat history
   */
  @Post(':chatId/block')
  async blockChat(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: string,
  ): Promise<ChatI> {
    const result = await this.chatService.blockChat(user.uid, Number(chatId));
    this.chatGateway.notifyAboutRefreshChat(result);
    return result;
  }

  /**
   * Unblock chat
   */
  @Post(':chatId/unblock')
  async unblockChat(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: string,
  ): Promise<ChatI> {
    const result = await this.chatService.unblockChat(user.uid, Number(chatId));
    this.chatGateway.notifyAboutRefreshChat(result);
    return result;
  }

  // ─── E2E public key endpoints ─────────────────────────────────────────────

  /**
   * Save or update the caller's E2E chat public key (Curve25519, base64).
   * Called once per device after key pair generation.
   */
  @Put('e2e/public-key')
  async saveChatPublicKey(
    @CurrentUser() user: UserI,
    @Body('publicKey') publicKey: string,
  ): Promise<{ success: boolean }> {
    await this.chatService.saveChatPublicKey(user.uid, publicKey);
    return { success: true };
  }

  /**
   * Fetch the E2E chat public key for any user by uid.
   * Returns null if the user has not yet published a key (E2E not set up on any device).
   */
  @Get('e2e/public-key/:uid')
  getChatPublicKey(
    @Param('uid') uid: string,
  ): Promise<{ publicKey: string | null }> {
    return this.chatService.getChatPublicKey(uid).then(publicKey => ({ publicKey }));
  }

  /**
   * Delete chat
   */
  @Delete(':chatId')
  async deleteChat(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: string,
  ): Promise<ApiResponse> {
    await this.chatService.deleteChat(user.uid, Number(chatId));
    this.chatGateway.notifyAboutDeleteChat(Number(chatId));
    return { success: true };
  }
}