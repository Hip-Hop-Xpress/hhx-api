// Route for sending push notifications to app users

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const { Expo } = require('expo-server-sdk');

const {
  sendNonexistentIdError,
  sendIncorrectTypeError,
  sendSchemaValidationError,
} = require('../errors/helpers');
const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');

const notifsCollectionName = 'notifications';
const ticketsCollectionName = 'tickets';
const hourToMs = 3.6e6;

const { sendPushNotifs } = require('./util/sendPushNotifs');
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
 *   POST /notifs         - send a message
 *   POST /notifs/tickets - send all stored tickets to Expo for receipts,
 *                          log/handle errors, and delete stale receipts
 */

/**
 * POST /notifs
 * - Sends a notification to Expo servers with info in the request body
 *   to all devices registered in our tokens collection
 * - Stores that notification in a notifications collection
 * - Stores tickets from Expo in a tickets collection
 */
routes.post('/', wrap(async (req, res, next) => {

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
  await db.collection(notifsCollectionName).add({
    ...notification,
    created: firestore.Timestamp.fromDate(dateCreated)
  });

  return res.status(OK).send({...notification, created: dateCreated.toString()});

}));

/**
 * POST /notifs/tickets
 * - Takes tickets in collection that are at least an hour old and
 *   sends them to Expo for receipts
 * - Logs all receipts that contain errors 
 * 
 * TODO: break this up into multiple endpoints/functions?
 * 
 * Taken mainly from here:
 * https://farazpatankar.com/push-notifications-in-react-native/
 */
routes.post('/tickets', wrap(async (req, res, next) => {

  // Grab tickets from collection that are an hour older or more
  let receiptIds = [];
  const tickets = await db.collection(ticketsCollectionName)
    .where('created', '<=', firestore.Timestamp.fromMillis(Date.now() - hourToMs))
    .get();
  
  let errorTickets = [];
  for (let ticketDoc of tickets.docs) {
    // Get all receipt id's from tickets that have them
    const ticketData = ticketDoc.data();
    if (ticketData.receiptId) {
      receiptIds.push(ticketData.receiptId);
    } else {
      // If the ticket doesn't have an id, it is an error
      // Send those in the response
      errorTickets.push({
        ...ticketData,
        created: ticketData.created.toDate().toString()
      })
    }
  }

  // Chunk receipt ids and handle them as chunks
  let errorReceipts = [];
  let expo = new Expo();
  const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  for (let chunk of receiptIdChunks) {
    try {
      // FIXME: change if there are too many receipts?
      // eslint-disable-next-line no-await-in-loop
      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
      for (let receiptId in receipts) {
        let { status, message, details } = receipts[receiptId];
        if (status === 'ok') {
          continue;
        } else if (status === 'error') {
          errorReceipts.push(receipts[receiptId]);
          console.error(`There was an error sending a notification: ${message}`);
          if (details && details.error) {
            console.error(`The error code is ${details.error}`);
            if (details.error === 'DeviceNotRegistered') {
              // TODO: set this push token to null
            }
            // TODO: handle other errors
          }
        }
      }     
    } catch (e) {
      console.error('Error reading receipt id chunks: ', e);
    }
  }

  // Delete tickets that have 'ok' response
  const successfulTickets = 
    await db.collection(ticketsCollectionName)
      .where('status', '==', 'ok')
      .where('created', '<=', firestore.Timestamp.fromMillis(Date.now() - hourToMs))
      .get();
  
  const successfulTicketIds = [];
  successfulTickets.forEach(doc => successfulTicketIds.push(doc.id));

  const deletionResults = [];
  for (let id of successfulTicketIds) {
    deletionResults.push(db.collection(ticketsCollectionName).doc(id).delete());
  }
  await Promise.all(deletionResults);

  // TODO: write documentation about this response
  return res.status(OK).send({
    receiptsRead: receiptIds.length,
    deletedTickets: successfulTicketIds.length,
    errorTickets: errorTickets,
    errorReceipts: errorReceipts
  });

}));

module.exports = routes;
