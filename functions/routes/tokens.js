// Tokens API route
// Used to hold Expo notification push tokens
// https://docs.expo.io/push-notifications/sending-notifications/

const routes = require('express').Router();
const admin = require('firebase-admin');
const { firestore } = require('firebase-admin');
const { Expo } = require('expo-server-sdk');
const db = admin.firestore();

// Error handling functions/constants
const {sendNonexistentIdError,} = require('../errors/helpers');
const wrap = require('../errors/wrap');
const { OK, INVALID_PARAMS } = require('../errors/codes');
const { INVALID_REQUEST_ERR } = require('../errors/types');

const collectionName = 'tokens';
const docName = 'push token';

const sendInvalidPushTokenError = (res) => {

  return res.status(INVALID_PARAMS).send({
    type: INVALID_REQUEST_ERR,
    code: INVALID_PARAMS.toString(),
    message: 'Invalid push token',
    param: null,
    original: null
  });

}

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

  // Request should include push token as a string
  const requestPushToken = req.body.pushToken;

  if (!Expo.isExpoPushToken(requestPushToken)) {
    console.error(
      'The following received in POST /v1/tokens and is not a push token: ',
      requestPushToken
    );
    return sendInvalidPushTokenError(res);
  }
  
  // Retrieve existing token if it already exists
  const tokenCollection = db.collection(collectionName);
  const receivedCollection = await tokenCollection.get();
  let existingToken = receivedCollection.docs.find(doc => 
    doc.data().pushToken === requestPushToken
  );
  
  const tokenDoc = {
    pushToken: requestPushToken,
    lastUpdated: firestore.Timestamp.fromDate(new Date())
  };

  if (existingToken === undefined) {
    // If the token doesn't exist, add to collection with new id
    await tokenCollection.add(tokenDoc);
  } else {
    // If token already exists, just update the timestamp
    await tokenCollection.doc(existingToken.id).update(tokenDoc);
  }

  // Send the token document as added in Firestore
  return res.status(OK).send({
    pushToken: tokenDoc.pushToken,
    lastUpdated: tokenDoc.lastUpdated.toDate().toString()
  });

}));

/**
 * GET /tokens/:id
 */
routes.get('/:id', wrap(async (req, res, next) => {

  const document = db.collection(collectionName).doc(req.params.id);

  await document.get().then(doc => {
    if (doc.exists) {

      // Fetch and send data if variation of :id is found
      let pushTokenDoc = doc.data();

      // Convert Timestamp to string representations of Date
      return res.status(OK).send({
        pushToken: pushTokenDoc.pushToken,
        lastUpdated: pushTokenDoc.lastUpdated.toDate().toString()
      });

    } else {
      // If ID is not found, send error response
      return sendNonexistentIdError(res, req.params.id, docName);
    }
  });

}));

/**
 * PUT /tokens/:id
 */
routes.put('/:id', wrap(async (req, res, next) => {

  // Request should include push token as a string
  const requestPushToken = req.body.pushToken;

  // Check that request body contains valid Expo push token
  if (!Expo.isExpoPushToken(requestPushToken)) {
    console.error(
      'The following received in PUT /v1/tokens/:id and is not a push token: ', 
      requestPushToken
    );
    return sendInvalidPushTokenError(req);
  }

  const document = db.collection(collectionName).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }

    const currentDate = new Date();
    const updatedTokenDoc = {
      pushToken: requestPushToken,
      lastUpdated: admin.firestore.Timestamp.fromDate(currentDate)
    };

    // Update doc in Firestore and send updated document with Timestamp as string
    docRef.update(updatedTokenDoc);
    return res.status(OK).send({
      pushToken: updatedTokenDoc.pushToken,
      lastUpdated: currentDate.toString()
    });

  });

  return null;

}));

/**
 * DELETE /tokens/:id
 */
routes.delete('/:id', wrap(async (req, res, next) => {

  const document = db.collection(collectionName).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
    
    const deletedPushToken = doc.data();
    docRef.delete();

    // Return string representations of deleted update's Timestamps
    return res.status(OK).send({
      pushToken: deletedPushToken.pushToken,
      lastUpdated: deletedPushToken.lastUpdated.toDate().toString()
    });
  });

}));


module.exports = routes;
