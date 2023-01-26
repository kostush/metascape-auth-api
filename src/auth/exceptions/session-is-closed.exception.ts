import { NotFoundException } from '@nestjs/common';

export class SessionIsClosedException extends NotFoundException {
  constructor(message: string) {
    super(message);
  }
}
