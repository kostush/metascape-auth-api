import { EntitySchema } from 'typeorm';
import { TokenModel } from '../models/token.model';

export const TokenSchema = new EntitySchema<TokenModel>({
  name: 'TokenModel',
  tableName: 'tokens',
  target: TokenModel,
  relations: {
    session: {
      type: 'many-to-one',
      target: 'SessionModel',
      orphanedRowAction: 'delete',
      onDelete: 'CASCADE',
    },
  },
  indices: [
    {
      columns: ['id'],
    },
  ],
  columns: {
    id: {
      type: String,
      primary: true,
    },
    sessionId: {
      type: String,
    },
    isClosed: {
      type: Boolean,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
});
