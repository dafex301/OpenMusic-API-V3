const routes = (handler) => [
	{
		method: 'GET',
		path: '/songs',
		handler: handler.getSongsHandler,
	},
	{
		method: 'GET',
		path: '/songs/{id}',
		handler: handler.getSongByIdHandler,
	},
	{
		method: 'POST',
		path: '/songs',
		handler: handler.postSongHandler,
	},
	{
		method: 'PUT',
		path: '/songs/{id}',
		handler: handler.putSongByIdHandler,
	},
	{
		method: 'DELETE',
		path: '/songs/{id}',
		handler: handler.deleteSongByIdHandler,
	},
];

module.exports = routes;
