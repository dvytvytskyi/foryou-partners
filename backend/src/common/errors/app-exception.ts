import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(code: string, message: string, status: HttpStatus, requestId = '') {
    super(
      {
        error: {
          code,
          message,
          request_id: requestId,
        },
      },
      status,
    );
  }
}
