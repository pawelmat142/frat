/** Created by Pawel Malek **/
import { HttpException } from '@nestjs/common';

/**
 * SWWException (Something Went Wrong) - Critical system errors
 * Redirects to special error page on frontend
 * HTTP Status: 599 (Custom System Error)
 */
import { Logger } from '@nestjs/common';
import { MyHttpCode } from '@shared/def/http.def';

export class SWWException extends HttpException {
  constructor(message: string = 'Something went wrong', source: any, details?: any) {
    super(
      {
        type: 'system_error',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      MyHttpCode.SWW,
    );

    const sourceClassName = source?.constructor?.name || typeof source || 'UNKNOWN';
    const logger = new Logger(sourceClassName);
    logger.error(`${message}`, details ? JSON.stringify(details) : undefined);
  }
}