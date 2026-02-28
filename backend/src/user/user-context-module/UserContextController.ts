import { Controller, Get, Param, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserI } from "@shared/interfaces/UserI";
import { CurrentUser } from "auth/decorators/CurrentUserDecorator";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { UserContextService } from "./UserContextService";
import { MeUserContext, UserContext } from "@shared/interfaces/UserContext";

@Controller('api/user-ctx')
@UseInterceptors(LogInterceptor)
export class UserContextController {

    constructor(
        private readonly userContextService: UserContextService,
    ) {}

    @Get('/:uid')
    public getUserContext(
        @CurrentUser() user: UserI,
        @Param('uid') uid: string
    ): Promise<UserContext> {
        return this.userContextService.getUserContext(user, uid);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    public getMeUserContext(
        @CurrentUser() user: UserI
    ): Promise<MeUserContext> {
        return this.userContextService.getMeUserContext(user);
    }
}
