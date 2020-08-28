// Updates API route

const Joi = require('@hapi/joi');

/**
 * Schematics for Updates data
 */
const updateString = Joi.string().min(1);
const updateId     = Joi.number().integer().min(0);
const updateTitle  = updateString;
const updateAuthor = updateString;
const updateBody = Joi.array().min(1).items(updateString.required());

const postSchema = Joi.object({
  id: updateId.required(),
  title: updateTitle.required(),
  author: updateAuthor.required(),
  body: updateBody.required()
});

const putSchema = Joi.object({
  title: updateTitle,
  author: updateAuthor,
  body: updateBody
});

module.exports = {
  postSchema,
  putSchema,
  updateBody,
};
