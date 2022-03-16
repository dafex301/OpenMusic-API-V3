const AuthorizationError = require('../../exceptions/AuthorizationError');
const ClientError = require('../../exceptions/ClientError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsHandler {
  constructor(service, collaborationsService, songsService, validator) {
    this._service = service;
    this._collaborationsService = collaborationsService;
    this._songsService = songsService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistHandler = this.getPlaylistHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongHandler = this.getPlaylistSongHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
    this.getPlaylistActivitiesHandler =
      this.getPlaylistActivitiesHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({
        name,
        owner: credentialId,
      });

      return h
        .response({
          status: 'success',
          message: 'Playlist berhasil dibuat',
          data: {
            playlistId,
          },
        })
        .code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deletePlaylist(playlistId);

      return h
        .response({
          status: 'success',
          message: 'Playlist berhasil dihapus',
        })
        .code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // Post song in playlist
  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePostSongToPlaylistPayload(request.payload);
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;

      await this._songsService.getSongById(songId);
      await this._service.verifyPlaylistsAccess(playlistId, credentialId);
      await this._service.addSongToPlaylist(playlistId, songId);

      // add activities
      await this._service.addPlaylistActivities(
        playlistId,
        songId,
        credentialId,
        'add',
      );

      return h
        .response({
          status: 'success',
          message: 'Lagu berhasil ditambahkan ke playlist',
        })
        .code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // Get songs in playlist
  async getPlaylistSongHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._service.verifyPlaylistsAccess(playlistId, credentialId);
      const playlistDetails = await this._service.getPlaylistDetails(
        playlistId,
      );
      const playlistSongs = await this._service.getPlaylistSongs(playlistId);
      return {
        status: 'success',
        data: {
          playlist: {
            id: playlistDetails.id,
            name: playlistDetails.name,
            username: playlistDetails.username,
            songs: playlistSongs,
          },
        },
      };
    } catch (error) {
      if (error instanceof AuthorizationError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      } else if (error instanceof NotFoundError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // Delete song in playlist
  async deletePlaylistSongHandler(request, h) {
    try {
      this._validator.validatePostSongToPlaylistPayload(request.payload);
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;

      await this._service.verifyPlaylistsAccess(playlistId, credentialId);

      await this._service.deleteSongFromPlaylist(
        playlistId,
        songId,
        credentialId,
      );

      // add activities
      await this._service.addPlaylistActivities(
        playlistId,
        songId,
        credentialId,
        'delete',
      );

      return h
        .response({
          status: 'success',
          message: 'Lagu berhasil dihapus dari playlist',
        })
        .code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  // Get activities
  async getPlaylistActivitiesHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;
      await this._service.verifyPlaylistsAccess(playlistId, credentialId);
      const activities = await this._service.getPlaylistActivities(playlistId);
      return {
        status: 'success',
        data: {
          playlistId: playlistId,
          activities,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = PlaylistsHandler;
