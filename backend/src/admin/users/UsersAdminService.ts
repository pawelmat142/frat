import { Injectable, Logger } from "@nestjs/common";
import { UserI, UserRole } from "@shared/interfaces/UserI";
import { UserService } from "user/services/UserService";

@Injectable()
export class UsersAdminService {
    
  private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly userService: UserService
    ) { }

    public listUsers(): Promise<UserI[]> {
        return this.userService.listUsers()
    }

    public deleteUser(uid: string): Promise<void> { 
        return this.userService.deleteUser(uid)
    }

    public assignRolesForUser(uid: string, roles: UserRole[]): Promise<UserI> {
        return this.userService.assignRolesForUser(uid, roles)
    }
}