/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    playlistid: {
      type: 'varchar(50)',
      references: 'playlists',
      onDelete: 'cascade',
    },
    userid: {
      type: 'varchar(50)',
      references: 'users',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
