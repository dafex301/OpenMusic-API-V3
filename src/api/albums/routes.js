const routes = (handler) => [
	{
		method: 'GET',
		path: '/albums',
		handler: handler.getAlbumsHandler,
	},
	{
		method: 'GET',
		path: '/albums/{id}',
		handler: handler.getAlbumByIdHandler,
	},
	{
		method: 'POST',
		path: '/albums',
		handler: handler.postAlbumHandler,
	},
	{
		method: 'PUT',
		path: '/albums/{id}',
		handler: handler.putAlbumByIdHandler,
	},
	{
		method: 'DELETE',
		path: '/albums/{id}',
		handler: handler.deleteAlbumByIdHandler,
	},
];

module.exports = routes;
