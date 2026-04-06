/** Created by Pawel Malek **/
import { Body, Controller, Delete, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserI } from '@shared/interfaces/UserI';
import { UserListedItem } from '@shared/interfaces/UserListedItem';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { AddUserListedItemRequest } from './dto/AddUserListedItemRequest';
import { UserListedItemService } from './services/UserListedItemService';

@Controller('api/user-listed')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard)
export class UserListedItemController {

    constructor(
        private readonly service: UserListedItemService,
    ) {}    

    @Post()
    addItem(
        @CurrentUser() user: UserI,
        @Body() body: AddUserListedItemRequest,
    ): Promise<UserListedItem> {
        return this.service.addItem(user.uid, body);
    }

    @Delete(':id')
    removeItem(
        @CurrentUser() user: UserI,
        @Param('id') id: string,
    ): Promise<void> {
        return this.service.removeItem(user.uid, Number(id));
    }
}
