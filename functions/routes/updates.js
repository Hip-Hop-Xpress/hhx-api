// Updates API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();
const { sendPushNotifs } = require('./util/sendPushNotifs');

// Error handling functions/constants
const {
  sendImmutableAttributeError,
  sendNonexistentIdError,
  sendExistingIdError,
  sendIncorrectTypeError,
  sendSchemaValidationError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');
const { postSchema, putSchema, updateBody } = require('../models/updates');

const collection = 'updates';
const docName = 'update';

/**
 * Updates endpoints
 *
 *   POST, GET               /updates
 *         GET, PUT, DELETE  /updates/:id
 *   POST, GET               /updates/:id/body
 *
 * TODO: add queries for filtering by month, year, etc.
 * TODO: add queries for number of updates
 */

/**
 * POST /updates
 */
routes.post(
  '/',
  wrap(async (req, res, next) => {
    // Validate request body using schema
    try {
      await postSchema.validateAsync(req.body);
    } catch (e) {
      return sendSchemaValidationError(res, e);
    }

    // Construct a Timestamp object using the current date
    const currentDate = new Date();
    const dateCreated = admin.firestore.Timestamp.fromDate(currentDate);

    // Try creating a document, and throw error if the doc exists
    try {
      await db.collection(collection).doc(`/${req.body.id}/`).create({
        id: req.body.id,
        title: req.body.title,
        dateCreated: dateCreated,
        lastUpdated: null,
        author: req.body.author,
        body: req.body.body,
      });
    } catch (e) {
      return sendExistingIdError(res, req.body.id, docName);
    }

    // Send push notification about new update
    const updateBody = req.body.body[0];
    await sendPushNotifs(req.body.title, updateBody, { screen: 'updates' });

    return res
      .status(OK)
      .send({ ...req.body, dateCreated: currentDate.toString() });
  })
);

/**
 * GET /updates
 */
routes.get(
  '/',
  wrap(async (req, res, next) => {
    // Query the collection and setup response
    let query = db.collection(collection);
    let response = [];

    // Get all documents from collection
    await query.get().then((snapshot) => {
      let docs = snapshot.docs;

      for (let update of docs) {
        let lastUpdated = null;

        // Convert lastUpdated attribute if not null
        if (update.data().lastUpdated !== null) {
          lastUpdated = update.data().lastUpdated.toDate().toString();
        }

        // Insert all data from server doc to response doc
        const selectedItem = {
          id: update.id,
          title: update.data().title,
          dateCreated: update.data().dateCreated.toDate(),
          lastUpdated: lastUpdated,
          author: update.data().author,
          body: update.data().body,
        };

        // Put the response doc into the response list
        response.push(selectedItem);
      }

      // Sort updates from latest to oldest
      response.sort((u1, u2) => u2.dateCreated - u1.dateCreated);

      // Send the response once every doc has been put in
      return res.status(OK).send(
        response.map((u) => ({
          ...u,
          dateCreated: u.dateCreated.toString(),
        }))
      );
    });
  })
);

/**
 * GET /updates/:id
 */
routes.get(
  '/:id',
  wrap(async (req, res, next) => {
    const document = db.collection(collection).doc(req.params.id);

    await document.get().then((doc) => {
      if (doc.exists) {
        // Fetch and send data if variation of :id is found
        let update = doc.data();

        // Convert Timestamps to string representations of Dates
        let dateCreated = update.dateCreated.toDate().toString();
        let lastUpdated = null;
        if (update.lastUpdated !== null) {
          lastUpdated = update.lastUpdated.toDate().toString();
        }

        return res.status(OK).send({
          ...update,
          dateCreated: dateCreated,
          lastUpdated: lastUpdated,
        });
      } else {
        // If ID is not found, send error response
        return sendNonexistentIdError(res, req.params.id, docName);
      }
    });
  })
);

/**
 * PUT /updates/:id
 */
routes.put(
  '/:id',
  wrap(async (req, res, next) => {
    // Validate request body for correct schema
    try {
      await putSchema.validateAsync(req.body);
    } catch (e) {
      // If client tries updating id, send immutable attribute error
      if (e.details[0].context.key === 'id') {
        return sendImmutableAttributeError(res, 'id');
      }
      return sendSchemaValidationError(res, e);
    }

    const document = db.collection(collection).doc(req.params.id);
    const docRef = document;

    await document.get().then((doc) => {
      if (!doc.exists) {
        return sendNonexistentIdError(res, req.params.id, docName);
      }

      docRef.update(req.body);

      // Create Timestamp from current Date and change the lastUpdated field
      const currentDate = new Date();
      const currentTimestamp = admin.firestore.Timestamp.fromDate(currentDate);
      docRef.update({ lastUpdated: currentTimestamp });

      // Spread operator to combine old data with updated data
      // Shared fields are overwritten by rightmost object (updated data)
      return res.status(OK).send({
        ...doc.data(),
        ...req.body,
        dateCreated: doc.data().dateCreated.toDate().toString(),
        lastUpdated: currentDate.toString(),
      });
    });

    // linting purposes
    return null;
  })
);

/**
 * DELETE /updates/:id
 */
routes.delete(
  '/:id',
  wrap(async (req, res, next) => {
    const document = db.collection(collection).doc(req.params.id);
    const docRef = document;

    await document.get().then((doc) => {
      if (!doc.exists) {
        return sendNonexistentIdError(res, req.params.id, docName);
      }

      const deletedUpdate = doc.data();
      docRef.delete();

      // Return string representations of deleted update's Timestamps
      return res.status(OK).send({
        ...deletedUpdate,
        dateCreated: deletedUpdate.dateCreated.toDate().toString(),
        lastUpdated:
          deletedUpdate.lastUpdated === null
            ? null
            : deletedUpdate.lastUpdated.toDate().toString(),
      });
    });
  })
);

/**
 * POST /updates/:id/body
 */
routes.post(
  '/:id/body',
  wrap(async (req, res, next) => {
    let newParagraphs = [];

    // Check that the body is either string or array of strings, and
    // add body contents to 'additions' if valid
    if (typeof req.body === 'string' || req.body instanceof String) {
      newParagraphs.push(req.body);
    } else if (Array.isArray(req.body)) {
      await updateBody.validateAsync(req.body);
      newParagraphs = req.body;
    } else {
      return sendIncorrectTypeError(
        res,
        'Body must be string or array of strings'
      );
    }

    const document = db.collection(collection).doc(req.params.id);
    const docRef = document;

    await document.get().then((doc) => {
      if (!doc.exists) {
        return sendNonexistentIdError(res, req.params.id, docName);
      }

      // Get the current body and add the additions
      let newBody = doc.data().body;
      for (let paragraph of newParagraphs) {
        newBody.push(paragraph);
      }

      // Update the body and send response
      docRef.update({ body: newBody });
      return res.status(OK).send(newBody);
    });

    // linting purposes
    return null;
  })
);

/**
 * GET /updates/:id/body
 */
routes.get(
  '/:id/body',
  wrap(async (req, res, next) => {
    const document = db.collection(collection).doc(req.params.id);

    await document.get().then((doc) => {
      if (doc.exists) {
        return res.status(OK).send(doc.data().body);
      } else {
        return sendNonexistentIdError(res, req.params.id, docName);
      }
    });
  })
);

module.exports = routes;
