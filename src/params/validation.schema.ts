import * as Joi from 'joi';
import PARAMETERS from './params.constants';
import { NODE_ENV } from 'metascape-common-api';

export const validationSchema = Joi.object({
  [PARAMETERS.NODE_ENV]: Joi.string()
    .valid(
      NODE_ENV.development,
      NODE_ENV.production,
      NODE_ENV.test,
      NODE_ENV.provision,
    )
    .required(),
  [PARAMETERS.AUTH_API_GRPC_URL]: Joi.string().required(),
  [PARAMETERS.USER_API_GRPC_URL]: Joi.string().required(),
  [PARAMETERS.WALLET_API_GRPC_URL]: Joi.string().required(),
  [PARAMETERS.JWT_AUTH_EXPIRES_IN]: Joi.string().required(),
  [PARAMETERS.JWT_AUTH_PRIVATE_KEY]: Joi.string().required(),
  [PARAMETERS.JWT_AUTH_PUBLIC_KEY]: Joi.string().required(),
  [PARAMETERS.JWT_AUTH_ALGORITHM]: Joi.string().required(),
  [PARAMETERS.JWT_REFRESH_EXPIRES_IN]: Joi.string().required(),
  [PARAMETERS.JWT_REFRESH_SECRET]: Joi.string().required(),
  [PARAMETERS.JWT_REFRESH_ALGORITHM]: Joi.string().required(),
  [PARAMETERS.DB_HOST]: Joi.string().required(),
  [PARAMETERS.DB_PORT]: Joi.number().required(),
  [PARAMETERS.DB_USER]: Joi.string().required(),
  [PARAMETERS.DB_PASSWORD]: Joi.string().required(),
  [PARAMETERS.DB_NAME]: Joi.string().required(),
});
