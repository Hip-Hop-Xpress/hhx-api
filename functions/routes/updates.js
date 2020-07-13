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
 * Schematics for Updates data
 */
const updateString = Joi.string().min(1);
const updateId     = Joi.number().integer().min(0);
const updateTitle  = updateString;
const updateAuthor = updateString;
const updateBody = Joi.array().min(1).items(projectString.required());

const postSchema = Joi.object({
  id: updateId.required(),
  title: updateTitle.required(),
  author: updateAuthor.required(),
  body: updateBody.required()
});

const putSchema = Joi.object({
  id: updateId,
  title: updateTitle,
  author: updateAuthor,
  body: updateBody
});

/**
 * Updates endpoints
 * 
 *   POST, GET               /updates
 *         GET, PUT, DELETE  /updates/:id
 *   POST, GET               /updates/:id/body
 * 
 * TODO: plan out your endpoints here!
 * TODO: add queries for filtering by month, year, etc.
 * TODO: add queries for number of updates
 */


module.exports = routes;
