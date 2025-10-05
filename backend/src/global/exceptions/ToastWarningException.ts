/** Created by Pawel Malek **/
import { HttpException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { MyHttpCode } from '@shared/def/http.def';

/**
 * ToastWarningException - Warnings that don't block actions
 * Shows yellow toast with warning message on frontend
 * HTTP Status: 461 (Custom Toast Warning)
 */
export class ToastWarningException extends HttpException {
  constructor(message: string, source?: any, details?: any) {
    super(
      {
        type: 'toast_warning',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      MyHttpCode.TOAST_WARNING,
    );

    const sourceClassName = source?.constructor?.name || typeof source || 'UNKNOWN';
    const logger = new Logger(sourceClassName);
    logger.warn(`${message}`, details ? JSON.stringify(details) : undefined);
  }
}