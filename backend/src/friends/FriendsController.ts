/** Created by Pawel Malek **/
import {
    Controller,
    Post,
    Patch,
    Delete,
    Get,
    Param,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { UserI } from '@shared/interfaces/UserI';
import { FriendshipService } from './services/FriendshipService';
import { FriendshipI } from '@shared/interfaces/FriendshipI';

@Controller('api/friends')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard)
export class FriendsController {

    constructor(
        private readonly friendshipService: FriendshipService,
    ) { }

    @Post('/invite/:addresseeUid')
    sendInvite(
        @CurrentUser() user: UserI,
        @Param('addresseeUid') addresseeUid: string,
    ): Promise<FriendshipI> {
        return this.friendshipService.sendInvite(user, addresseeUid);
    }

    @Patch('/accept/:friendshipId')
    acceptInvite(
        @CurrentUser() user: UserI,
        @Param('friendshipId') friendshipId: string,
    ): Promise<FriendshipI> {
        return this.friendshipService.acceptInvite(user, Number(friendshipId));
    }

    @Patch('/reject/:friendshipId')
    rejectInvite(
        @CurrentUser() user: UserI,
        @Param('friendshipId') friendshipId: string,
    ): Promise<FriendshipI> {
        return this.friendshipService.rejectInvite(user, Number(friendshipId));
    }

    @Delete('/:friendshipId')
    removeFriend(
        @CurrentUser() user: UserI,
        @Param('friendshipId') friendshipId: string,
    ): Promise<void> {
        return this.friendshipService.removeFriend(user, Number(friendshipId));
    }

    @Get()
    getFriends(@CurrentUser() user: UserI): Promise<FriendshipI[]> {
        return this.friendshipService.getFriends(user.uid);
    }

    @Get('/pending/received')
    getPendingReceived(@CurrentUser() user: UserI): Promise<FriendshipI[]> {
        return this.friendshipService.getPendingReceived(user.uid);
    }

    @Get('/pending/sent')
    getPendingSent(@CurrentUser() user: UserI): Promise<FriendshipI[]> {
        return this.friendshipService.getPendingSent(user.uid);
    }
}
