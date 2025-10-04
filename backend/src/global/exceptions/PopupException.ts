/** Created by Pawel Malek **/
import { HttpException, Logger } from '@nestjs/common';
import { MyHttpCode } from '@shared/def/http.def';

/**
 * PopupException - User errors that should be shown in a popup dialog
 * Shows popup with error message on frontend
 * HTTP Status: 462 (Custom Popup Error)
 */
export class PopupException extends HttpException {
  constructor(message: string, source?: any, details?: any) {
    super(
      {
        type: 'popup_error',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      MyHttpCode.POPUP_ERROR,
    );
    if (source) {
      const className = source.constructor?.name || typeof source;
      const logger = new Logger(className);
      logger.error(`${message}`, details ? JSON.stringify(details) : undefined);
    }
  }
}
