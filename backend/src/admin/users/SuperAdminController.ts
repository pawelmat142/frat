import { Controller, Get, Param, UseInterceptors } from "@nestjs/common";
import { LogInterceptor } from "global/interceptors/LogInterceptor";
import { UserI, UserRoles } from "@shared/interfaces/UserI";
import { UsersAdminService, NukeResult } from "admin/users/UsersAdminService";

//>>>>> TODO REMOVE!!!!! -

@Controller('api/super-admin')
@UseInterceptors(LogInterceptor)
export class SuperAdminController {

    constructor(
        private readonly usersAdminService: UsersAdminService
    ) {}

    @Get('/:password/:uid/set-admin')
    listUsers(
        @Param('password') password: string,
        @Param('uid') uid: string
    ): Promise<UserI> {
        this.usersAdminService.checkPassword(password);
        return this.usersAdminService.assignRolesForUser(uid, [UserRoles.ADMIN, UserRoles.SUPERADMIN]);
    }

    // DANGER: wipes all Postgres tables, Cloudinary assets and Firebase accounts.
    // Test-environment only.
    // :includeAdminTables ('true'/'false') decides whether admin reference tables
    // (e.g. dictionaries, translations) are also wiped. Defaults to false when omitted.
    @Get(['/:password/nuke', '/:password/nuke/:includeAdminTables'])
    nukeEverything(
        @Param('password') password: string,
        @Param('includeAdminTables') includeAdminTables?: string
    ): Promise<NukeResult> {
        this.usersAdminService.checkPassword(password);
        return this.usersAdminService.nukeEverything(includeAdminTables === 'true');
    }
}
