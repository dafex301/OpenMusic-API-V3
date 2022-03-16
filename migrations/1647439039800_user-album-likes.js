/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    userid: {
      type: 'varchar(50)',
      references: 'users',
      onDelete: 'cascade',
    },
    albumid: {
      type: 'varchar(50)',
      references: 'albums',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
