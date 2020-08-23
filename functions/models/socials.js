// Social media Object schema

const Joi = require('@hapi/joi');
const socialTypeRegex = require('./socialTypes');

/**
 * Schematics for your data
 */

// A really naive RegExp that checks that the type is one of these strings 
const socialType   = Joi.string().regex(socialTypeRegex);
const socialHandle = Joi.string().min(1);
const socialUrl    = Joi.string().uri();

// Schema for POST requests
const postSchema = Joi.object({
  type:   socialType.required(),
  handle: socialHandle.required(),
  url:    socialUrl.required()
});

// schema for PUT requests
const putSchema = Joi.object({
  handle: socialHandle,
  url:    socialUrl
});

module.exports = {
  postSchema,
  putSchema,
  socialType,
};
