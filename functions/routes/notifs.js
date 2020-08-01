// Route for sending push notifications to app users

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

const {
  sendNonexistentIdError,
  sendIncorrectTypeError,
  sendSchemaValidationError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');

/**
 * Schematics for notification data data
 */
const notifTitle = Joi.string().min(1);
const notifBody = Joi.string().min(1);
const notifData = Joi.object();

// Schema for POST requests
const postSchema = Joi.object({
  title: notifTitle.required(),
  body: notifBody.required(),
  data: notifData
});

/**
 * Notifs endpoints
 * 
 *   POST /notifs
 */

routes.post('/', wrap(async (req, res, next) => {

  try {
    await postSchema.validateAsync(req.body);
  } catch (e) {
    return sendSchemaValidationError(res, e);
  }

  // TODO: send push notification to Expo servers
  // TODO: store notification data in database for archival reasons ig

}));

module.exports = routes;
