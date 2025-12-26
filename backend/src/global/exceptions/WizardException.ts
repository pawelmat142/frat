/** Created by Pawel Malek **/
import { HttpException } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { MyHttpCode } from '@shared/def/http.def';

/**
 * WizardException - User errors, validation errors
 * Shows red toast with error message on frontend
 * HTTP Status: 459 (Custom Wizard Error)
 */

export class WizardException extends HttpException {
  constructor(message: string, source: any, details?: any) {
    super(
      {
        type: 'wizard_error',
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      MyHttpCode.WIZARD_ERROR,
    );

    const sourceClassName = source?.constructor?.name || typeof source || 'UNKNOWN';
    const logger = new Logger(sourceClassName);
    logger.error(`${message}`, details ? JSON.stringify(details) : undefined);
  }
}
