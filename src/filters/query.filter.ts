import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, UnprocessableEntityException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import type { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import * as _ from 'lodash';

@Catch(UnprocessableEntityException)
export class HttpExceptionFilter
  implements ExceptionFilter<UnprocessableEntityException>
{
  catch(exception: UnprocessableEntityException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const r = exception.getResponse() as { message: ValidationError[] };

    const validationErrors = r.message;
    this.validationFilter(validationErrors);
    const message = this.messageValidation(validationErrors);

    response.status(statusCode).json({
      code: statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private validationFilter(validationErrors: ValidationError[]): void {
    for (const validationError of validationErrors) {
      const children = validationError.children;

      if (children && !_.isEmpty(children)) {
        this.validationFilter(children);

        return;
      }

      delete validationError.children;

      const constraints = validationError.constraints;

      if (!constraints) {
        return;
      }

      for (const [constraintKey, constraint] of Object.entries(constraints)) {
        // convert default messages
        if (!constraint) {
          // convert error message to error.fields.{key} syntax for i18n translation
          constraints[constraintKey] = `error.fields.${_.snakeCase(
            constraintKey,
          )}`;
        }
      }
    }
  }
  private messageValidation(validationErrors: ValidationError[]) {
    const i18n = I18nContext.current();
    const messageObject = {};
    for (const validationError of validationErrors) {
      messageObject[validationError.property] = i18n.t(
        Object.values(validationError.constraints)[0],
      );
    }
    return messageObject;
  }
}
