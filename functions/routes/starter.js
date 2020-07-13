// Starter code for API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Error handling functions/constants
const {
  sendNonexistentIdError,
  sendIncorrectTypeError,
  sendSchemaValidationError,
} = require('../errors/helpers');

const { OK } = require('../errors/codes');

// TODO: Collection/doc name in Firestore
const collection = '';
const docName = '';

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
 * ___ endpoints
 * 
 * TODO: plan out your endpoints here!
 */

// TODO: write your endpoints here!

module.exports = routes;
