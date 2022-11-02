import { ConflictException } from '@nestjs/common';

export class WalletNotAttachedToUserException extends ConflictException {}
