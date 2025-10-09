import { Body, Controller, Delete, Get, Param, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { UserI, UserRole, UserRoles } from "@shared/interfaces/UserI";
import { UsersAdminService } from "./UsersAdminService";
import { RolesGuard } from "auth/guards/RolesGuard";
import { Roles } from "auth/decorators/RolesDecorator";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";

@Controller('api/admin/users')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
export class UsersAdminController {
    
    constructor(
        private readonly usersAdminService: UsersAdminService
    ) {}
    
    @Get('list-users')
    listUsers(): Promise<UserI[]> {
        return this.usersAdminService.listUsers();
    }

    @Delete('delete-user/:uid')
    @Roles(UserRoles.SUPERADMIN)
    deleteUser(@Param('uid') uid: string): Promise<void> {
        return this.usersAdminService.deleteUser(uid);
    }

    @Put(':uid/assign-roles')
    assignRolesForUser(
        @Param('uid') uid: string,
        @Body() dto: { roles: UserRole[] }
    ): Promise<UserI> {
        return this.usersAdminService.assignRolesForUser(uid, dto.roles)
    }

}