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

// This is a wrapper function that moves errors to a middleware function in app.js
const wrap = require('../errors/wrap');

// HTTP Responses (so we don't use magic numbers)
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

/**
 * TODO: write your endpoints here! Below is an example
 * 
 * NOTE: DO NOT FORGET THE wrap()
 * This catches errors for you that aren't normally caught
 * HOWEVER, you can add it AFTER you write the function, because
 *  writing it before removes intellisense
 * So write the entire route and then put the wrap() around
 */

routes.get('/', wrap(async (req, res, next) => {

  return res.status(OK).send();

}));

module.exports = routes;
