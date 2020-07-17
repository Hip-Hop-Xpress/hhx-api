// Social media API route
const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Error handling functions/constants
const {
  sendExistingIdError,
  sendNonexistentIdError,
  sendIncorrectTypeError,
  sendSchemaValidationError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');

// Collection/doc name in Firestore
const collection = 'socials';
const docName = 'social media platform';

/**
 * TODO: Schematics for your data
 */

// A really naive RegExp that checks that the type is one of these strings 
const socialTypeRegex = new RegExp('^(angellist|codepen|envelope|etsy|facebook|flickr|foursquare|github-alt|github|gitlab|instagram|linkedin|medium|pinterest|quora|reddit-alien|soundcloud|stack-overflow|steam|stumbleupon|tumblr|twitch|twitter|google|google-plus-official|vimeo|vk|weibo|wordpress|youtube)$');
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
  url: socialUrl
});

/**
 * ___ endpoints
 * 
 * TODO: plan out your endpoints here!
 */

/**
 * TODO: write your endpoints here! Below is an example
 * 
 * NOTE: DO NOT FORGET THE wrap()
 * This catches errors for you that aren't normally caught
 * HOWEVER, you can add it AFTER you write the function, because
 *  writing it before removes intellisense
 * So write the entire route and then put the wrap() around
 */

routes.get('/', wrap(async (req, res, next) => {

  return res.status(OK).send();

}));

module.exports = routes;
