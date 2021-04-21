import { HttpException, HttpStatus, ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExceptionsFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let code = null;
    let detail = null;
    let pointers = [];

    if (exception instanceof HttpException) {
      const res: any = exception.getResponse();
      code = exception.getStatus();

      if (typeof res === 'object') {
        detail = res.error;

        if (Array.isArray(res.details)) {
          pointers = res.details.map(({ message, context }: any) => ({
            message,
            path: context.key,
          }));
        } else {
          pointers = [
            {
              message: res.message,
              path: null,
            },
          ];
        }
      } else {
        detail = res;
      }
    } else {
      detail = 'Internal Server Error';
      code = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(code).json({
      meta: {
        url: request.url,
        method: request.method,
        status: code,
      },
      data: null,
      errors: [
        {
          code,
          detail,
          pointers,
        },
      ],
    });
  }
}
