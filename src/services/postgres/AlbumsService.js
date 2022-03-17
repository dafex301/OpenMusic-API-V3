const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const query = {
      text: 'SELECT * FROM albums',
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return result.rows[0];
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async getSongsByAlbumId(id) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE albumid = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async setLikeAlbum(albumid, userid) {
    const getLikeQuery = {
      text: 'SELECT * FROM user_album_likes WHERE albumid = $1 AND userid = $2',
      values: [albumid, userid],
    };
    const getLikeResult = await this._pool.query(getLikeQuery);

    if (!getLikeResult.rowCount) {
      const id = `likes-${nanoid(16)}`;
      const insertLikeQuery = {
        text: 'INSERT INTO user_album_likes (id, userid, albumid) VALUES ($1, $2, $3)',
        values: [id, userid, albumid],
      };
      const insertLikeResult = await this._pool.query(insertLikeQuery);

      if (!insertLikeResult.rowCount) {
        throw new InvariantError('Like gagal ditambahkan');
      }
    } else {
      // dislike the album
      const deleteLikeQuery = {
        text: 'DELETE FROM user_album_likes WHERE albumid = $1 AND userid = $2',
        values: [albumid, userid],
      };
      const deleteLikeResult = await this._pool.query(deleteLikeQuery);

      if (!deleteLikeResult.rowCount) {
        throw new InvariantError('Like gagal dihapus');
      }
    }
  }

  async getLikeAlbum(albumid) {
    const query = {
      text: 'SELECT userid FROM user_album_likes WHERE albumid = $1',
      values: [albumid],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = AlbumsService;
