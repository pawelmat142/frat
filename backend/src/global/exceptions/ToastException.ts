/** Created by Pawel Malek **/
import { HttpException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { MyHttpCode } from '@shared/def/http.def';

/**
 * ToastException - User errors, validation errors
 * Shows red toast with error message on frontend
 * HTTP Status: 460 (Custom Toast Error)
 */

export class ToastException extends HttpException {
  constructor(message: string, source?: any, details?: any) {
    super(
      {
        type: 'toast_error',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      MyHttpCode.TOAST_ERROR,
    );
    if (source) {
      const className = source.constructor?.name || typeof source;
      const logger = new Logger(className);
      logger.error(`${message}`, details ? JSON.stringify(details) : undefined);
    }
  }
}
