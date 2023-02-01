import { ConflictException } from '@nestjs/common';

export class SessionIsClosedException extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}
