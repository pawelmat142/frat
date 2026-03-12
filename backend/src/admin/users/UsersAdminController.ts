import { Body, Controller, Delete, Get, Param, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { UserI, UserRole, UserRoles } from "@shared/interfaces/UserI";
import { UsersAdminService } from "./UsersAdminService";
import { RolesGuard } from "auth/guards/RolesGuard";
import { Roles } from "auth/decorators/RolesDecorator";
import { JwtAuthGuard } from "auth/guards/JwtAuthGuard";
import { Serialize } from "global/decorators/Serialize";
import { UserEntity } from "user/model/UserEntity";

@Controller('api/admin/users')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
export class UsersAdminController {
    
    constructor(
        private readonly usersAdminService: UsersAdminService
    ) {}
    
    @Get('list-users')
    @Serialize(UserEntity)
    listUsers(): Promise<UserI[]> {
        return this.usersAdminService.listUsers();
    }

    @Delete('delete-user/:uid')
    @Roles(UserRoles.SUPERADMIN)
    deleteUser(@Param('uid') uid: string): Promise<void> {
        return this.usersAdminService.deleteUser(uid);
    }

    @Put(':uid/assign-roles')
    @Serialize(UserEntity)
    @Roles(UserRoles.SUPERADMIN)
    assignRolesForUser(
        @Param('uid') uid: string,
        @Body() dto: { roles: UserRole[] }
    ): Promise<UserI> {
        return this.usersAdminService.assignRolesForUser(uid, dto.roles)
    }

}