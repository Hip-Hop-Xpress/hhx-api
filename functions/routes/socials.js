// Social media API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Error handling functions/constants
const {
  sendIncorrectTypeError,
  sendSchemaValidationError,
  sendExistingDocError,
  sendNonexistentDocError,
  sendImmutableAttributeError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');
const { postSchema, putSchema, socialType } = require('../models/socials');

// Collection/doc name in Firestore
const collection = 'socials';
const docName = 'social media platform';
const identifierName = 'type';

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
routes.post(
  '/',
  wrap(async (req, res, next) => {
    try {
      // Validate request body using schema
      await postSchema.validateAsync(req.body);
    } catch (e) {
      // TODO: clean this up with class based errors later
      // If the type is not valid, send a special error message
      if (e.details[0].context.key === 'type') {
        return sendIncorrectTypeError(
          res,
          `"${req.body.type}" is not one of the social media types for react-native-elements social icon: https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type`,
          identifierName
        );
      }

      return sendSchemaValidationError(res, e);
    }

    // Try creating a document, and throw error if the doc exists
    try {
      await db
        .collection(collection)
        .doc(`/${req.body.type}/`)
        .create(req.body);
    } catch (e) {
      return sendExistingDocError(res, identifierName, req.body.type, docName);
    }

    return res.status(OK).send(req.body);
  })
);

/**
 * GET /socials
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

      for (let social of docs) {
        // Insert all data from server doc to response doc
        const selectedItem = social.data();

        // Put the response doc into the response list
        response.push(selectedItem);
      }

      // Send the response once every doc has been put in
      return res.status(OK).send(response);
    });
  })
);

/**
 * GET /socials/types
 */
routes.get(
  '/types',
  wrap(async (req, res, next) => {
    // Query the collection and setup types
    let query = db.collection(collection);
    let types = [];

    // Get all documents from collection
    await query.get().then((snapshot) => {
      let docs = snapshot.docs;

      for (let social of docs) {
        const socialType = social.id;
        types.push(socialType);
      }

      // Send the response once every doc has been put in
      return res.status(OK).send(types);
    });
  })
);

/**
 * GET /socials/:type
 */
routes.get(
  '/:type',
  wrap(async (req, res, next) => {
    // Validate type param first
    try {
      await socialType.validateAsync(req.params.type);
    } catch (e) {
      return sendIncorrectTypeError(
        res,
        `"${req.params.type}" is not one of the social media types for react-native-elements social icon: https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type`,
        identifierName
      );
    }

    const document = db.collection(collection).doc(req.params.type);

    await document.get().then((doc) => {
      if (doc.exists) {
        // Fetch and send data if social media obj of :type is found
        let response = doc.data();
        return res.status(OK).send(response);
      } else {
        // If type is not found, send error response
        return sendNonexistentDocError(
          res,
          identifierName,
          req.params.type,
          docName
        );
      }
    });

    // linting error
    return null;
  })
);

/**
 * PUT /socials/:type
 */
routes.put(
  '/:type',
  wrap(async (req, res, next) => {
    // Validate request body for correct schema
    try {
      await putSchema.validateAsync(req.body);
    } catch (e) {
      // If request tried changing type, notify that type is immutable
      if (req.body.type !== undefined) {
        return sendImmutableAttributeError(res, identifierName);
      }
      return sendSchemaValidationError(res, e);
    }

    const document = db.collection(collection).doc(req.params.type);
    const docRef = document;

    await document.get().then((doc) => {
      if (!doc.exists) {
        return sendNonexistentDocError(
          res,
          identifierName,
          req.params.type,
          docName
        );
      }

      docRef.update(req.body);

      // Spread operator to combine old data with updated data
      // Shared fields are overwritten by rightmost object (updated data)
      return res.status(OK).send({ ...doc.data(), ...req.body });
    });

    // linting purposes
    return null;
  })
);

/**
 * DELETE /socials/:type
 */
routes.delete(
  '/:type',
  wrap(async (req, res, next) => {
    const document = db.collection(collection).doc(req.params.type);
    const docRef = document;

    await document.get().then((doc) => {
      if (!doc.exists) {
        return sendNonexistentDocError(
          res,
          identifierName,
          req.params.type,
          docName
        );
      }

      const deletedSocial = doc.data();
      docRef.delete();
      return res.status(OK).send(deletedSocial);
    });
  })
);

module.exports = routes;
