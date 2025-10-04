/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { AuthService } from './services/AuthService';
import { AuthController } from './AuthController';
import { FirebaseConfig } from 'config/FirebaseConfig';

@Module({
  imports: [
    // TypeOrmModule.forFeature([
    //   DictionaryEntity,
    // ]),
  ],
  controllers: [
    AuthController
    // DictionariesController, DictionariesImportServiceController
  ],
  providers: [
    AuthService,
    FirebaseConfig
    // DictionariesService, DictionariesRepo
  ],
  exports: [
  ],
})
export class AuthModule {}
