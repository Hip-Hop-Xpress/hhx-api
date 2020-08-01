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

const collectionName = 'notifications';

const sendPushNotifs = require('./util/sendPushNotifs');
const { firestore } = require('firebase-admin');

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

routes.post('/', (async (req, res, next) => {

  try {
    await postSchema.validateAsync(req.body);
  } catch (e) {
    return sendSchemaValidationError(res, e);
  }

  // Send push notification to Expo servers
  const notification = req.body;
  await sendPushNotifs(notification.title, notification.body, notification.data); 
  
  // Store notification data in database for archival reasons
  const dateCreated = new Date();
  await db.collection(collectionName).add({
    ...notification,
    created: firestore.Timestamp.fromDate(dateCreated)
  });

  return res.status(OK).send({...notification, created: dateCreated.toString()});

}));

module.exports = routes;
