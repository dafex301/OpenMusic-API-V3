const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumid }) {
    const id = 'song-' + nanoid();
    const query = {
      text: 'INSERT INTO songs (id, title, year, performer, genre, duration, albumid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumid],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    if (title && performer) {
      const result = await this._pool.query(
        'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE LOWER($1) AND LOWER(performer) LIKE LOWER($2)',
        ['%' + title + '%', '%' + performer + '%'],
      );
      return result.rows;
    } else if (title) {
      const result = await this._pool.query(
        'SELECT id, title, performer FROM songs WHERE LOWER(title) LIKE LOWER($1)',
        ['%' + title + '%'],
      );
      return result.rows;
    } else if (performer) {
      const result = await this._pool.query(
        'SELECT id, title, performer FROM songs WHERE LOWER(performer) LIKE LOWER($1)',
        ['%' + performer + '%'],
      );
      return result.rows;
    }
    const result = await this._pool.query(
      'SELECT id, title, performer FROM songs',
    );
    return result.rows;
  }

  async getSongById(id) {
    const result = await this._pool.query('SELECT * FROM songs WHERE id = $1', [
      id,
    ]);
    if (result.rowCount === 0) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    return result.rows[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumid }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, albumid = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumid, id],
    };
    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal memperbarui lagu. Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteSongById(id) {
    const result = await this._pool.query(
      'DELETE FROM songs WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rowCount === 0) {
      throw new NotFoundError('Gagal menghapus lagu. Lagu tidak ditemukan');
    }
  }
}

module.exports = SongsService;
