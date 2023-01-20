import { EntitySchema } from 'typeorm';
import { SessionModel } from '../models/session.model';

export const SessionSchema = new EntitySchema<SessionModel>({
  name: 'SessionModel',
  tableName: 'sessions',
  target: SessionModel,
  relations: {
    tokens: {
      type: 'one-to-many',
      target: 'TokenModel',
      inverseSide: 'session',
      cascade: ['insert', 'update', 'remove', 'soft-remove'],
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
    userId: {
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
