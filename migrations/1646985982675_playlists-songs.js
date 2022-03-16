/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    playlistid: {
      type: 'varchar(50)',
      references: 'playlists',
      onDelete: 'cascade',
    },
    songid: {
      type: 'varchar(50)',
      references: 'songs',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
