import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { UserI } from "@shared/interfaces/UserI";
import { UserService } from "user/services/UserService";

@Injectable()
export class UsersAdminService {
    
  private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly userService: UserService
    ) { }

    listUsers(): Promise<UserI[]> {
        return this.userService.listUsers();
    }
}