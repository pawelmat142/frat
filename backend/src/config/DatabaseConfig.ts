/** Created by Pawel Malek **/
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const result: TypeOrmModuleOptions = {
      type: 'postgres',
      host: this.configService.get('DATABASE_HOST', 'localhost'),
      port: this.configService.get('DATABASE_PORT', 5432),
      username: this.configService.get('DATABASE_USER', 'jobhigh_user'),
      password: this.configService.get('DATABASE_PASSWORD', 'jobhigh_pass'),
      database: this.configService.get('DATABASE_NAME', 'jobhigh_db'),
      entities: [join(__dirname, '..', '**', '*Entity{.ts,.js}')],
      synchronize: this.configService.get('NODE_ENV') === 'development',
      logging: this.configService.get('NODE_ENV') === 'development',
    };
    return result;
  }
}
