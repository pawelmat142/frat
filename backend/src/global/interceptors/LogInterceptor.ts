import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
  Logger,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';

export const LogInterceptorTypes = {
  DEFAULT: 'DEFAULT',
  ADMIN: 'ADMIN'
} as const 

export type LogInterceptorType = typeof LogInterceptorTypes[keyof typeof LogInterceptorTypes];

@Injectable()
export class LogInterceptor implements NestInterceptor {

  protected getType(): LogInterceptorType {
    return LogInterceptorTypes.DEFAULT;
  }

  private readonly logger = new Logger(); 

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;
    const type = this.getType();
    if (type === LogInterceptorTypes.ADMIN) {
      this.logger.verbose(`[START] ${url}`);
    } else {
      this.logger.log(`[START] ${url}`);
    }

    const response = context.switchToHttp().getResponse();
    
    return next.handle().pipe(tap(() => {
      if (type === LogInterceptorTypes.ADMIN) {
        this.logger.verbose(`[STOP] ${url}`);
      } else {
        this.logger.log(`[STOP] ${url}`);
      }
    }));
  }
}
