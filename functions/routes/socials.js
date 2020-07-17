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
  sendExistingDocError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK, SERVER_ERR } = require('../errors/codes');

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
  url:    socialUrl
});

/**
 * Social media endpoints
 * 
 *   POST, GET               /socials
 *         GET               /socials/types
 *         GET, PUT, DELETE  /socials/:type
 */

/**
 * POST /socials
 */
routes.post('/', wrap(async (req, res, next) => {

  // Validate request body using schema
  try {
    await postSchema.validateAsync(req.body);
  } catch (e) {
    return sendSchemaValidationError(res, e);
  }

  // Try creating a document, and throw error if the doc exists
  try {
    await db.collection(collection).doc(`/${req.body.type}/`).create(req.body);
  } catch (e) {
    return sendExistingDocError(res, 'type', req.body.type, docName);
  }
  
  return res.status(OK).send(req.body);

}));

/**
 * GET /socials
 */
routes.get('/', wrap(async (req, res, next) => {

  // Query the collection and setup response
  let query = db.collection(collection);
  let response = [];

  // Get all documents from collection
  await query.get().then(snapshot => {
    let docs = snapshot.docs;

    for (let social of docs) {
      // Insert all data from server doc to response doc
      const selectedItem = social.data();

      // Put the response doc into the response list
      response.push(selectedItem);
    }

    // Send the response once every doc has been put in
    return res.status(OK).send(response);
  });

}));

/**
 * GET /socials/types
 */
routes.get('/types', wrap(async (req, res, next) => {

  return res.status(SERVER_ERR).send();

}));

/**
 * GET /socials/:type
 */
routes.get('/:type', wrap(async (req, res, next) => {

  return res.status(SERVER_ERR).send();

}));

/**
 * PUT /socials/:type
 */
routes.put('/:type', wrap(async (req, res, next) => {

  return res.status(SERVER_ERR).send();

}));

/**
 * DELETE /socials/:type
 */
routes.delete('/:type', wrap(async (req, res, next) => {

  return res.status(SERVER_ERR).send();

}));

module.exports = routes;
