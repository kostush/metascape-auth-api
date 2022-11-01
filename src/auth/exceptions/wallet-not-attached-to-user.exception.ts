import { ConflictException, HttpStatus } from '@nestjs/common';

export class walletNotAttachedToUserException extends ConflictException {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, message);
  }
}
