// Tokens API route
// Used to hold Expo notification push tokens
// https://docs.expo.io/push-notifications/sending-notifications/

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const db = admin.firestore();

// Error handling functions/constants
const {
  sendNonexistentIdError,
  sendIncorrectTypeError,
  sendSchemaValidationError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');

const collection = 'tokens';
const docName = 'push token';

/**
 * TODO: Schematics for your data
 */

// TODO: schema for POST requests
const postSchema = Joi.object({

});

// TODO: schema for PUT requests
const putSchema = Joi.object({

});

/**
 * Token endpoints
 * 
 *   POST             /tokens
 *   GET, PUT, DELETE /tokens/:id
 * 
 * Rationale for endpoints:
 *   Unlike the other routes, exposing all Expo push tokens could allow
 *   people to use the endpoint maliciously (ex. sending spam notifications
 *   using the push tokens). Using Firebase auto-generated ids and providing
 *   a GET endpoint for only specific tokens will help with development but
 *   hopefully prevent malicious use of the endpoint.
 */

/**
 * POST /tokens
 */
routes.post('/', wrap(async (req, res, next) => {

  return res.status(OK).send();

}));

/**
 * GET /tokens/:id
 */
routes.get('/:id', wrap(async (req, res, next) => {

  return res.status(OK).send();

}));

/**
 * PUT /tokens/:id
 */
routes.put('/:id', wrap(async (req, res, next) => {

  return res.status(OK).send();

}));

/**
 * DELETE /tokens/:id
 */
routes.delete('/:id', wrap(async (req, res, next) => {

  return res.status(OK).send();

}));



module.exports = routes;
