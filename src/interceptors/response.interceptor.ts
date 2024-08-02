import {
    CallHandler,
    ExecutionContext,
    HttpException,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { catchError, Observable, throwError } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  @Injectable()
  export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((data) => {
          if (data == undefined) return null;
          const statusCode = data.statusCode;
          const message = data.message;
          if (statusCode != null) delete data.statusCode;
          if (message != null) delete data.message;
          return {
            code: context.switchToHttp().getResponse().statusCode || 200,
            message: message ? message : 'success',
            data,
          };
        }),
        catchError((err) => {
            if (err instanceof HttpException) {
              if (err.getResponse() instanceof String) {
                return throwError(() => ({
                  statusCode: err.getStatus(),
                  message: err.getResponse(),
                }));
              } else return throwError(() => err);
            }
            return throwError(() => err);
          }),
      );
    }
  }
  
  export class ResponseErrorInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        catchError((err) => {
          if (err instanceof HttpException) {
            if (err.getResponse() instanceof String) {
              return throwError(() => ({
                statusCode: err.getStatus(),
                message: err.getResponse(),
              }));
            } else return throwError(() => err);
          }
          return throwError(() => err);
        }),
      );
    }
  }