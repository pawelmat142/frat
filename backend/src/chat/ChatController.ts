/** Created by Pawel Malek **/
import { Controller, Get, Post, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { ChatService } from './services/ChatService';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { UserI } from '@shared/interfaces/UserI';
import { ChatGateway } from './ChatGateway';
import { ChatResponse } from '@shared/interfaces/ChatI';
import { ApiResponse } from '@shared/dto/dtos';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {

  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) { }

  /**
   * Get all chats for current user
   */
  @Get()
  getMyChats(@CurrentUser() user: UserI): Promise<ChatResponse[]> {
    return this.chatService.getUserChats(user.uid);
  }

  /**
   * Get or create a direct chat with another user
   */
  @Post('direct/:recipientUid')
  async getOrCreateDirectChat(
    @CurrentUser() user: UserI,
    @Param('recipientUid') recipientUid: string,
  ) {
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
  ) {
    return this.chatService.getChatById(chatId, user.uid);
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
  cleanChat(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: string,
  ): Promise<ApiResponse> {
    return this.chatService.cleanChat(user.uid, Number(chatId));
  }

  /**
   * Clean chat history
   */
  @Post(':chatId/block')
  blockChat(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: string,
  ): Promise<ApiResponse> {
    return this.chatService.blockChat(user.uid, Number(chatId));
  }

  /**
   * Unblock chat
   */
  @Post(':chatId/unblock')
  unblockChat(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: string,
  ): Promise<ApiResponse> {
    return this.chatService.unblockChat(user.uid, Number(chatId));
  }

  /**
   * Delete chat
   */
  @Delete(':chatId')
  deleteChat(
    @CurrentUser() user: UserI,
    @Param('chatId') chatId: string,
  ): Promise<ApiResponse> {
    return this.chatService.deleteChat(user.uid, Number(chatId));
  }
}