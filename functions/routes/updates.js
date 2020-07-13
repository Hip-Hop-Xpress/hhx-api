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

/**
 * POST /updates
 */
routes.post('/', (req, res) => {

}); 

/**
 * GET /updates
 */
routes.get('/', (req, res) => {

});

/**
 * GET /updates/:id
 */
routes.get('/:id', (req, res) => {

});

/**
 * PUT /updates/:id
 */
routes.put('/:id', (req, res) => {

});

/**
 * DELETE /updates/:id
 */
routes.delete('/:id', (req, res) => {

});

/**
 * POST /updates/:id/body
 */
routes.post('/:id/body', (req, res) => {

});

/**
 * GET /updates/:id/body
 */
routes.get('/:id/body', (req, res) => {

});

module.exports = routes;
