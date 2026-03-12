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
  constructor(message: string, source: any, cause?: Error) {
    super(
      {
        type: 'toast_error',
        message,
        timestamp: new Date().toISOString(),
      },
      MyHttpCode.TOAST_ERROR,
      cause ? { cause } : undefined,
    );

    // TODO remove
    console.log(cause)

    const sourceClassName = source?.constructor?.name || typeof source || 'UNKNOWN';
    const logger = new Logger(sourceClassName);
    logger.error(message, cause?.stack ?? this.stack);
  }
}
