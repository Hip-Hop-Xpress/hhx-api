// Location API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Error handling functions/constants
const { sendSchemaValidationError } = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');

// Collection/doc name in Firestore
const collection = 'location';
const locationId = 'bus'; // doc id in Firestore

const { locationSchema } = require('../models/location');

/**
 * Location endpoints
 *
 *   GET, PUT /location
 *
 * TODO: use Firestore's GeoPoint type:
 *       https://firebase.google.com/docs/reference/js/firebase.firestore.GeoPoint
 */

/**
 * GET /location
 */
routes.get(
  '/',
  wrap(async (req, res) => {
    const locationDoc = db.collection(collection).doc(locationId);

    await locationDoc.get().then((doc) => {
      let locationData = doc.data();
      return res.status(OK).send(locationData);
    });
  })
);

/**
 * PUT /location
 */
routes.put(
  '/',
  wrap(async (req, res, next) => {
    // Validate schema before updating
    try {
      await locationSchema.validateAsync(req.body);
    } catch (e) {
      return sendSchemaValidationError(res, e);
    }

    const document = db.collection(collection).doc(locationId);
    const docRef = document;

    await document.get().then((doc) => {
      docRef.update(req.body);

      // Spread operator to combine old data with updated data
      // Shared fields are overwritten by rightmost object (updated data)
      return res.status(OK).send({ ...doc.data(), ...req.body });
    });

    // linting purposes
    return null;
  })
);

module.exports = routes;
