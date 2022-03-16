const InvariantError = require('../../exceptions/InvariantError');
const {
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
} = require('./schema');

const AuthenticationValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const { error } = PostAuthenticationPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
  validatePutAuthenticationPayload: (payload) => {
    const { error } = PutAuthenticationPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
  validateDeleteAuthenticationPayload: (payload) => {
    const { error } = DeleteAuthenticationPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = AuthenticationValidator;
