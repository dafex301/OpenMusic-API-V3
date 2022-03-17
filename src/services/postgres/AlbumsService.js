const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
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

    await this._cacheService.delete(`albums`);

    return result.rows[0].id;
  }

  async getAlbums() {
    try {
      const result = await this._cacheService.get(`albums`);
      return { albums: JSON.parse(result), isCache: 1 };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM albums',
      };
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Album tidak ditemukan');
      }
      await this._cacheService.set(`albums`, JSON.stringify(result.rows));
      return { albums: result.rows };
    }
  }

  async getAlbumById(id) {
    try {
      const result = await this._cacheService.get(`album:${id}`);
      return { album: JSON.parse(result), isCache: 1 };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [id],
      };
      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      await this._cacheService.set(
        `album:${id}`,
        JSON.stringify(result.rows[0]),
      );
      return { album: result.rows[0] };
    }
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

    await this._cacheService.delete(`album:${id}`);
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

    await this._cacheService.delete(`album:${id}`);
  }

  async getSongsByAlbumId(id) {
    try {
      // get songs from cache
      const result = await this._cacheService.get(`album-songs:${id}`);
      return { songs: JSON.parse(result), isCache: 1 };
    } catch (error) {
      // if cache doesn't exist
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE albumid = $1',
        values: [id],
      };
      const result = await this._pool.query(query);

      // save to cache
      await this._cacheService.set(
        `album-songs:${id}`,
        JSON.stringify(result.rows),
      );
      return { songs: result.rows };
    }
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
    await this._cacheService.delete(`likes:${albumid}`);
  }

  async getLikeAlbum(albumid) {
    try {
      // get from cache
      const result = await this._cacheService.get(`likes:${albumid}`);
      return { likes: JSON.parse(result), isCache: 1 };
    } catch (error) {
      // if cache doesn't exist
      const query = {
        text: 'SELECT userid FROM user_album_likes WHERE albumid = $1',
        values: [albumid],
      };
      const result = await this._pool.query(query);

      // save to cache
      await this._cacheService.set(
        `likes:${albumid}`,
        JSON.stringify(result.rows),
      );
      return { likes: result.rows };
    }
  }
}

module.exports = AlbumsService;
