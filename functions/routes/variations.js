// Variations routes will go here

const routes = require('express').Router();
const admin = require('firebase-admin');

let serviceAccount = require('../permissions.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://hhx-api/48896.firebaseio.com/'
});

const db = admin.firestore();

/**
 * Variations endpoint
 * /variations
 * /variations/:id
 * /variations/:id/images
 */

/**
 * POST /variations
 */
routes.post('/', (req, res) => {

});

/**
 * GET /variations
 */
routes.get('/', (req, res) => {

});

/**
 * PUT /variations
 */
routes.put('/', (req, res) => {

});

/**
 * DELETE /variations
 */
routes.delete('/', (req, res) => {

});
