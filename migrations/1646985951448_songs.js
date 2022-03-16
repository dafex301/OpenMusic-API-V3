/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    title: {
      type: 'varchar(255)',
      notNull: true,
    },
    year: {
      type: 'integer',
      notNull: true,
    },
    genre: {
      type: 'varchar(255)',
      notNull: true,
    },
    performer: {
      type: 'varchar(255)',
      notNull: true,
    },
    duration: {
      type: 'integer',
    },
    albumid: {
      type: 'varchar(50)',
      references: 'albums',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('songs');
};
