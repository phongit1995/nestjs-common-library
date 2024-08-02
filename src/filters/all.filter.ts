import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext, I18nTranslation } from 'nestjs-i18n';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const i18n = I18nContext.current<I18nTranslation>(host);
    try {
      const status = exception.getStatus();
      const message = exception.message;

      response.status(status).json({
        code: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: i18n?.i18n?.translate(message as never) || message.toString(),
      });
    } catch {
      response.status(500).json({
        code: 500,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.stack,
      });
    }
  }
}
