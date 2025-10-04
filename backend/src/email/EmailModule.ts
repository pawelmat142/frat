/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { EmailService } from './EmailService';
import { EmailConfig } from './EmailConfig';

@Module({
  providers: [
    EmailService, 
    EmailConfig
],
  exports: [
    EmailService
],
})
export class EmailModule {}
