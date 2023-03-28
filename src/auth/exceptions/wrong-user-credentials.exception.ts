import { ForbiddenException } from '@nestjs/common';

export class WrongUserCredentialsException extends ForbiddenException {
  constructor(message: string) {
    super(message);
  }
}
