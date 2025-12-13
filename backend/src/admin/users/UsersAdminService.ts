import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserI, UserRole } from "@shared/interfaces/UserI";
import { UserService } from "user/services/UserService";

@Injectable()
export class UsersAdminService {
    
  private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) { }

    public checkPassword(password: string): void {
        const superadminPassword = this.configService.get<string>('SUPERADMIN_PASSWORD');
        if (password !== superadminPassword) {
            throw new Error('Invalid superadmin password');
        }
        this.logger.log('Passwsord matches!!')
    }

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