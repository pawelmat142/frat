/** Created by Pawel Malek **/
import { Global, Module } from '@nestjs/common';
import { SocketGateway } from './SocketGateway';
import { AuthModule } from 'auth/AuthModule';
import { UserModule } from 'user/UserModule';

@Global()
@Module({
  imports: [AuthModule, UserModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
