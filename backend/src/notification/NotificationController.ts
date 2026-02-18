import { Controller, Get, Param, Patch, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserI } from "@shared/interfaces/UserI";
import { CurrentUser } from "auth/decorators/CurrentUserDecorator";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { NotificationService } from "./services/NotificationService";

@Controller('api/notifications')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard)
export class NotificationsController {

    constructor(
        private readonly notificationService: NotificationService,
    ) {}

    @Get()
    getNotifications(@CurrentUser() user: UserI) {
        return this.notificationService.getUserNotifications(user.uid);
    }

    @Patch('/mark-as-read/:notificationId')
    markAsRead(
        @CurrentUser() user: UserI,
        @Param('notificationId') notificationId: string,
    ): Promise<void> {
        return this.notificationService.markAsRead(user, notificationId);
    }
}