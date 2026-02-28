import { Controller, Get, Param, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserI } from "@shared/interfaces/UserI";
import { CurrentUser } from "auth/decorators/CurrentUserDecorator";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { UserContextService } from "./UserContextService";

@Controller('api/user-ctx')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard)
export class UserContextController {

    constructor(
        private readonly userContextService: UserContextService,
    ) {}

    @Get('/:uid')
    public getUserContext(
        @CurrentUser() user: UserI,
        @Param('uid') uid: string
    ) {
        return this.userContextService.getUserContext(user, uid);
    }

}