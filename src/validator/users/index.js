const InvariantError = require('../../exceptions/InvariantError');
const { UserPayloadSchema } = require('./schema');

const UserValidator = {
  validateUserPayload: (payload) => {
    const { error } = UserPayloadSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = UserValidator;
