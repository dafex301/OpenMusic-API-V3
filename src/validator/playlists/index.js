const InvariantError = require('../../exceptions/InvariantError');
const { PostPlaylistSchema, PostSongToPlaylistSchema } = require('./schema');

const PlaylistValidator = {
  validatePlaylistPayload: (payload) => {
    const { error } = PostPlaylistSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },

  validatePostSongToPlaylistPayload: (payload) => {
    const { error } = PostSongToPlaylistSchema.validate(payload);

    if (error) {
      throw new InvariantError(error.message);
    }
  },
};

module.exports = PlaylistValidator;
