import { Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { UserI, UserRoles } from "@shared/interfaces/UserI";
import { UsersAdminService } from "admin/users/UsersAdminService";

@Controller('api/super-admin')
@UseInterceptors(LogInterceptor)
export class SuperAdminController {
    
    constructor(
        private readonly usersAdminService: UsersAdminService
    ) {}
    
    //>>>>> TODO REMOVE!!!!!
    @Get('/:password/:uid/set-admin')
    listUsers(
        @Param('password') password: string,
        @Param('uid') uid: string
    ): Promise<UserI> {
        this.usersAdminService.checkPassword(password);
        return this.usersAdminService.assignRolesForUser(uid, [UserRoles.ADMIN, UserRoles.SUPERADMIN]);
    }
}
