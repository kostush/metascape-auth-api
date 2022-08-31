import * as Joi from 'joi';
import PARAMETERS from './params.constants';

export const validationSchema = Joi.object({
  [PARAMETERS.NODE_ENV]: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .required(),
  [PARAMETERS.AUTH_API_GRPC_URL]: Joi.string().required(),
  [PARAMETERS.JWT_SECRET]: Joi.string().required(),
  [PARAMETERS.JWT_EXPIRES_IN]: Joi.string().required(),
});
