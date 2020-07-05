// Projects API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

const httpCodes = require('../errors/codes');
const errorTypes = require('../errors/types');

/**
 * Projects endpoints
 * 
 *   POST, GET               /projects
 *         GET, PUT, DELETE  /projects/:id
 *   POST, GET               /projects/:id/members
 *   POST, GET               /projects/:id/description
 * 
 * TODO: add support for query strings eventually
 */

module.exports = routes;
