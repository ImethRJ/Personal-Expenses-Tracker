import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
        ? (responseBody as any).message
        : responseBody;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      error: Array.isArray(message) ? message.join(', ') : message,
    });
  }
}
