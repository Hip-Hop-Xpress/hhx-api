// Variations routes will go here

const routes = require('express').Router();
const admin = require('firebase-admin');
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
  return res.status(200).send('Variations endpoint is alive!');
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

/**
 * GET /variations/:id
 */
routes.get('/:id', (req, res) => {

})

/**
 * PUT /variations/:id
 */
routes.put('/:id', (req, res) => {

})

/**
 * DELETE /variations/:id
 */
routes.delete('/:id', (req, res) => {

})

module.exports = routes;
