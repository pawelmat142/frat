import { Controller, Delete, Get, Param, UseInterceptors } from "@nestjs/common";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { UserI } from "@shared/interfaces/UserI";
import { UsersAdminService } from "./UsersAdminService";

// TODO roles guardy
@Controller('api/admin/users')
@UseInterceptors(LogInterceptor)
export class UsersAdminController {

    constructor(
        private readonly usersAdminService: UsersAdminService
    ) {}
    
    @Get('list-users')
    listUsers(): Promise<UserI[]> {
        return this.usersAdminService.listUsers();
    }

    @Delete('delete-user/:uid')
    deleteUser(@Param('uid') uid: string): Promise<void> {
        return this.usersAdminService.deleteUser(uid);
    }

}