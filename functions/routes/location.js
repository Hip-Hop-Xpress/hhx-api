// Location API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Error handling functions/constants
const {
  sendIncorrectTypeError,
  sendSchemaValidationError,
} = require('../errors/helpers');

const { OK } = require('../errors/codes');

// Collection/doc name in Firestore
const collection = 'location';
const docName = 'location';

// TODO: Schema

/**
 * Location endpoints
 * 
 *   GET, PUT /location
 * 
 */

/**
 * GET /location
 */
routes.get('/', (req, res) => {
  (async () => {

  })();
});

/**
 * PUT /location
 */
routes.put('/', (req, res) => {
  (async () => {

  })();
});

module.exports = routes;