import { ConflictException, HttpStatus } from '@nestjs/common';

export class WalletNotAttachedToUserException extends ConflictException {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, message);
  }
}
