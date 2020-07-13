// Updates API route

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

const collection = 'updates';
const docName = 'update';

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
 * Updates endpoints
 * 
 * TODO: plan out your endpoints here!
 * TODO: add queries for filtering by month, year, etc.
 * TODO: add queries for number of updates
 */

// TODO: write your tests here!

module.exports = routes;
