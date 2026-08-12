import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UserI, UserRole } from "@shared/interfaces/UserI";
import { UserService } from "user/services/UserService";
import { CloudinaryService } from "user/UserManagement/CloudinaryService";
import { FirebaseConfig } from "auth/services/FirebaseConfig";

export interface NukeResult {
    postgres: string;
    cloudinary: string;
    firebase: string;
}

@Injectable()
export class UsersAdminService {

  private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly firebaseConfig: FirebaseConfig,
        @InjectDataSource() private readonly dataSource: DataSource,
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

    /**
     * DANGER: fully wipes the environment - all Postgres tables, all Cloudinary
     * assets and Firebase Authentication accounts for every uid found in
     * jh_users. Intended for the test environment only, to periodically reset
     * all data.
     * Each target is cleared independently (Promise.allSettled) so a failure in
     * one system doesn't prevent cleanup of the others.
     */
    public async nukeEverything(): Promise<NukeResult> {
        this.logger.warn('NUKE EVERYTHING requested - wiping Postgres, Cloudinary and Firebase');

        // Fetch uids before truncating Postgres, otherwise the list is lost.
        const uids = await this.getAllUserUids();

        const [postgres, cloudinary, firebase] = await Promise.allSettled([
            this.truncateAllTables(),
            this.cloudinaryService.deleteAllResources(),
            this.deleteFirebaseUsersByUids(uids),
        ]);

        const summarize = (result: PromiseSettledResult<void>): string =>
            result.status === 'fulfilled' ? 'ok' : `error: ${result.reason?.message ?? result.reason}`;

        const summary: NukeResult = {
            postgres: summarize(postgres),
            cloudinary: summarize(cloudinary),
            firebase: summarize(firebase),
        };

        this.logger.warn(`NUKE EVERYTHING finished: ${JSON.stringify(summary)}`);
        return summary;
    }

    private async truncateAllTables(): Promise<void> {
        const tables: { tablename: string }[] = await this.dataSource.query(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
        );
        if (!tables.length) {
            this.logger.warn('No Postgres tables found to truncate');
            return;
        }
        const tableNames = tables.map(t => `"${t.tablename}"`).join(', ');
        await this.dataSource.query(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`);
        this.logger.warn(`Truncated ${tables.length} Postgres tables: ${tables.map(t => t.tablename).join(', ')}`);
    }

    private async getAllUserUids(): Promise<string[]> {
        const rows: { uid: string }[] = await this.dataSource.query(`SELECT uid FROM jh_users`);
        return rows.map(r => r.uid);
    }

    /** Deletes only the Firebase accounts whose uid exists in jh_users (chunked, max 1000 per call). */
    private async deleteFirebaseUsersByUids(uids: string[]): Promise<void> {
        if (!uids.length) {
            this.logger.warn('No user uids found - skipping Firebase deletion');
            return;
        }
        const auth = this.firebaseConfig.admin.auth();
        const chunkSize = 1000;
        let deletedCount = 0;
        for (let i = 0; i < uids.length; i += chunkSize) {
            const chunk = uids.slice(i, i + chunkSize);
            const deleteResult = await auth.deleteUsers(chunk);
            deletedCount += deleteResult.successCount;
            if (deleteResult.failureCount > 0) {
                this.logger.error(
                    `Failed to delete ${deleteResult.failureCount} Firebase users: ${JSON.stringify(deleteResult.errors)}`
                );
            }
        }
        this.logger.warn(`Deleted ${deletedCount}/${uids.length} Firebase users (matched from jh_users)`);
    }
}