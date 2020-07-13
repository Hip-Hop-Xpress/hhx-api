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
const updateBody = Joi.array().min(1).items(updateString.required());

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
  (async () => {

    // Validate request body using schema
    try {
      await postSchema.validateAsync(req.body);
    } catch (e) {
      return sendSchemaValidationError(res, e);
    }

    // Construct a Timestamp object using the current date
    const currentDate = new Date();
    const dateCreated = admin.firestore.Timestamp.fromDate(currentDate);

    await db.collection(collection).doc(`/${req.body.id}/`)
      .create({
        id: req.body.id,
        title: req.body.title,
        dateCreated: dateCreated,
        lastUpdated: null,
        author: req.body.author,
        body: req.body.body
      });

    return res.status(OK).send(req.body);

  })();
}); 

/**
 * GET /updates
 */
routes.get('/', (req, res) => {
  (async () => {

    // Query the collection and setup response
    let query = db.collection(collection);
    let response = [];

    // Get all documents from collection
    await query.get().then(snapshot => {
      let docs = snapshot.docs;

      for (let update of docs) {

        let lastUpdated = null;

        // Convert lastUpdated attribute if not null
        if (update.data().lastUpdated !== null) {
          lastUpdated = update.data().lastUpdated.toDate().toString();
        }

        // Insert all data from server doc to response doc
        const selectedItem = {
          id: update.id,
          title: update.data().title,
          dateCreated: update.data().dateCreated.toDate().toString(),
          lastUpdated: lastUpdated,
          author: update.data().author,
          body: update.data().body,
        };

        // Put the response doc into the response list
        response.push(selectedItem);
      }

      // Send the response once every doc has been put in
      return res.status(OK).send(response);
    });

  })();
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
