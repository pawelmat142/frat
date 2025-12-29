/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(DatabaseConfig.name);

  constructor(private configService: ConfigService) {
    this.validateConfig();
  }

  get host(): string {
    return this.configService.get<string>('DATABASE_HOST', 'localhost');
  }

  get port(): number {
    return this.configService.get<number>('DATABASE_PORT', 5432);
  }

  get username(): string {
    return this.configService.get<string>('DATABASE_USER', 'jobhigh_user');
  }

  get password(): string {
    return this.configService.get<string>('DATABASE_PASSWORD', 'jobhigh_pass');
  }

  get database(): string {
    return this.configService.get<string>('DATABASE_NAME', 'jobhigh_db');
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  private validateConfig(): void {
    const required = [
      'DATABASE_HOST',
      'DATABASE_PORT',
      'DATABASE_USER',
      'DATABASE_PASSWORD',
      'DATABASE_NAME',
    ];

    const missing = required.filter(
      (key) => !this.configService.get<string>(key),
    );

    if (missing.length > 0) {
      this.logger.error(
        `Missing Database configuration: ${missing.join(', ')}.`,
      );
    } else {
      this.logger.log('Database configuration loaded successfully.');
    }
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const result: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      database: this.database,
      entities: [join(__dirname, '..', '**', '*Entity{.ts,.js}')],
      synchronize: this.nodeEnv === 'development',
      // logging: this.nodeEnv === 'development',
    };
    return result;
  }
}
