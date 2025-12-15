import { Injectable } from '@nestjs/common';
import { LogInterceptor, LogInterceptorType, LogInterceptorTypes } from 'global/interceptors/LogInterceptor';

@Injectable()
export class AdminLogInterceptor extends LogInterceptor {

      protected getType(): LogInterceptorType {
        return LogInterceptorTypes.ADMIN;
      }
}
