const ClientError = require('../../exceptions/ClientError');

class AlbumsHandler {
  constructor(service, validator, storageService, uploadValidator) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this._uploadValidator = uploadValidator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumsHandler = this.getAlbumsHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.getAlbumLikeHandler = this.getAlbumLikeHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { name, year } = request.payload;
      const albumId = await this._service.addAlbum({ name, year });
      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumsHandler(request, h) {
    try {
      const { albums, isCache } = await this._service.getAlbums();
      const response = h.response({
        status: 'success',
        message: 'Berhasil mengambil daftar album',
        data: {
          albums,
        },
      });
      if (isCache) response.header('X-Data-Source', 'cache');
      response.code(200);
      return response;
    } catch (error) {
      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { album, isCache: isCacheAlbum } = await this._service.getAlbumById(
        id,
      );
      const { songs, isCache: isCacheSong } =
        await this._service.getSongsByAlbumId(id);

      // change key
      album['coverUrl'] = album['coverurl'];
      delete album['coverurl'];

      // get songs list
      album['songs'] = songs;

      const response = h.response({
        status: 'success',
        message: 'Berhasil mengambil album',
        data: {
          album,
        },
      });
      response.code(200);

      // Jika menerima dari cache maka header dicustom
      if (isCacheAlbum || isCacheSong)
        response.header('X-Data-Source', 'cache');

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload);
      const { id } = request.params;
      const { name, year } = request.payload;
      await this._service.editAlbumById(id, { name, year });
      const response = h.response({
        status: 'success',
        message: 'Berhasil mengubah album',
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);
      const response = h.response({
        status: 'success',
        message: 'Berhasil menghapus album',
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // Album Cover Handler
  async postAlbumCoverHandler(request, h) {
    try {
      const { data } = request.payload;
      this._uploadValidator.validateImageHeaders(data.hapi.headers);

      const filename = await this._storageService.writeFile(data, data.hapi);

      const response = h.response({
        status: 'success',
        data: {
          fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`,
        },
      });
      response.code(201);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // Album Like Handler
  async postAlbumLikeHandler(request, h) {
    try {
      const { id: albumid } = request.params;
      const { id: userid } = request.auth.credentials;
      // check album
      await this._service.getAlbumById(albumid);

      await this._service.setLikeAlbum(albumid, userid);
      const response = h.response({
        status: 'success',
        message: 'Berhasil melakukan aksi',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getAlbumLikeHandler(request, h) {
    try {
      const { id } = request.params;
      const { likes, isCache } = await this._service.getLikeAlbum(id);
      const response = h.response({
        status: 'success',
        data: {
          likes: likes.length,
        },
      });
      response.code(200);

      // Jika menerima dari cache maka header dicustom
      if (isCache) response.header('X-Data-Source', 'cache');

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumsHandler;
