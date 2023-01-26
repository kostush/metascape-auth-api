import { NotFoundException } from '@nestjs/common';

export class TokenIsClosedException extends NotFoundException {
  constructor(message: string) {
    super(message);
  }
}
