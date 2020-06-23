// Variations API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const { isSchema } = require('@hapi/joi');
const db = admin.firestore();

/**
 * Variations endpoints
 *  /variations
 *  /variations/:id
 *  /variations/:id/images
 * 
 * // TODO: add schema validation
 * // TODO: add other error codes (id not found, etc)
 * // TODO: add support for query strings
 */

const postSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required(),
    
  name: Joi.string()
    .min(1)
    .required(),

  date: Joi.string()
    .min(4)
    .required(),
  
  description: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required(),

  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        caption: Joi.string().required(),
        componentImage: Joi.bool().required()
      })
    )
    .min(1)
    .required()
});

/*
 Schema:
 {
    id: integer
    name: string,
    date: string,
    description: [
      array of strings
    ],
    images: [
      {
        url: string of URL pointing to image URL,
        caption: string,
        componentImage: boolean,
      },
    ]
  }
 */

/**
 * POST /variations
 */
routes.post('/', (req, res) => {
  (async () => {
    try {
      // Validate request body using schema
      await postSchema.validateAsync(req.body);

      await db.collection('variations').doc(`/${req.body.id}/`)
        .create({
          name: req.body.name,
          date: req.body.date,
          description: req.body.description,
          images: req.body.images,
        });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();

});

/**
 * GET /variations
 */
routes.get('/', (req, res) => {
  (async () => {
    try {
      // Query the collection and setup response
      let query = db.collection('variations');
      let response = [];

      // Get all documents from collection
      await query.get().then(snapshot => {
        let docs = snapshot.docs;

        // There must be some way to avoid this linting error...
        // eslint-disable-next-line promise/always-return
        for (let variation of docs) {
          // Insert all data from server doc to response doc
          const selectedItem = {
            id: variation.id,
            name: variation.data().name,
            date: variation.data().date,
            description: variation.data().description,
            images: variation.data().images,
          };

          // Put the response doc into the response list
          response.push(selectedItem);
        }
      });

      // Send the response once every doc has been put in
      return res.status(200).send(response);

    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();

});

/**
 * GET /variations/:id
 */
routes.get('/:id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('variations').doc(req.params.id);
      let item = await document.get();
      let response = item.data();
      return res.status(200).send(response);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  })();
});

/**
 * PUT /variations/:id
 */
routes.put('/:id', (req, res) => {
  (async () => {
    try {
      // TODO: validate request body for correct schema
      const document = db.collection('variations').doc(req.params.id);
      await document.update(req.body);
      return res.status(200).send();
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  })();
})

/**
 * DELETE /variations/:id
 */
routes.delete('/:id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('variations').doc(req.params.id);
      await document.delete();
      return res.status(200).send();
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  })();
})

module.exports = routes;
