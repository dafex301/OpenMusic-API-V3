const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistid}',
    handler: handler.postExportPlaylistsHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
