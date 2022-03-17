const Joi = require('joi');

const AlbumPayloadsSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().min(1900).max(2022).required(),
  coverUrl: Joi.string(),
});

module.exports = { AlbumPayloadsSchema };
