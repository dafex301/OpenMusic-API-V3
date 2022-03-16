const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadsSchema } = require('./schema');

const AlbumsValidator = {
	validateAlbumPayload: (payload) => {
		const { error } = AlbumPayloadsSchema.validate(payload);

		if (error) {
			throw new InvariantError(error.message);
		}
	},
};

module.exports = AlbumsValidator;
