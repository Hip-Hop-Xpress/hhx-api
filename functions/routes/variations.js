// Variations API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

const httpCodes = require('../errors/codes');
const errorTypes = require('../errors/types');

/**
 * Schematics for Variation data
 */
const variationId          = Joi.number().integer().min(0);
const variationName        = Joi.string().min(1);
const variationDate        = Joi.string().min(4);
const variationDescription = Joi.array().min(1).items(Joi.string().required());
const variationImage       = Joi.object({
                               url:            Joi.string().uri().required(),
                               caption:        Joi.string().allow("").required(),
                               componentImage: Joi.bool().required()
                            });
const variationImages      = Joi.array().min(1).items(variationImage);
                            

/**
 * POST /variations schema
 */
const postSchema = Joi.object({
  id:          variationId.required(),
  name:        variationName.required(),
  date:        variationDate.required(),
  description: variationDescription.required(),
  images:      variationImages.required()
});

// PUT /variations/:id schema
const putSchema = Joi.object({
  id:          variationId,
  name:        variationName,
  date:        variationDate,
  description: variationDescription,
  images:      variationImages
});

/**
 * Variations endpoints
 * 
 *   POST, GET               /variations
 *         GET, PUT, DELETE  /variations/:id
 *   POST, GET               /variations/:id/images
 *   POST, GET               /variations/:id/description
 * 
 * TODO: add support for query strings eventually
 * TODO: fix DRY for error handling and accessing simple items
 * TODO: return uniform error responses
 */

/**
 * POST /variations
 */
routes.post('/', (req, res) => {
  (async () => {
    try {
      // Validate request body using schema
      try {
        await postSchema.validateAsync(req.body);
      } catch (e) {
        return res.status(422).send(e.details)
      }

      await db.collection('variations').doc(`/${req.body.id}/`)
        .create({
          id: req.body.id,
          name: req.body.name,
          date: req.body.date,
          description: req.body.description,
          images: req.body.images,
        });
      return res.status(200).send(req.body);
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

        // Send the response once every doc has been put in
        return res.status(200).send(response);
      });

      // Return null for linter's sake
      return null;

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

      await document.get().then(doc => {
          if (doc.exists) {
            // Fetch and send data if variation of :id is found
            let response = doc.data();
            return res.status(httpCodes.OK).send(response);
          } else {
            // If ID is not found, send error response
            const errorResponse = {
              type: errorTypes.ID_NOT_FOUND_ERR,
              code: httpCodes.INVALID_PARAMS.toString(),
              message: `The requested variation with id ${req.params.id} does not exist!`,
              param: 'id'
            };

            return res.status(httpCodes.INVALID_PARAMS).send(errorResponse);
          }
        }
      );
      
      // for linting purposes
      return null;

    } catch (e) {
      console.log(e);
      return res.status(httpCodes.SERVER_ERR).send(e);
    }
  })();
});

/**
 * PUT /variations/:id
 */
routes.put('/:id', (req, res) => {
  (async () => {
    try {
      // Validate request body for correct schema
      try {
        await putSchema.validateAsync(req.body);
      } catch (e) {
        return res.status(422).send(e.details);
      }

      const document = db.collection('variations').doc(req.params.id);
      const docRef = document;

      await document.get().then(doc => {
        if (!doc.exists) {
          return res.status(404).send(`Error: Variation id ${req.params.id} does not exist!`);
        }

        docRef.update(req.body);

        // Spread operator to combine old data with updated data
        // Shared fields are overwritten by rightmost object (updated data)
        return res.status(200).send({...doc.data(), ...req.body});

      });

      return null;

    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  })();
});

/**
 * DELETE /variations/:id
 */
routes.delete('/:id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('variations').doc(req.params.id);
      const docRef = document;

      await document.get().then(doc => {
        if (!doc.exists) {
          return res.status(404).send(`Error: Variation id ${req.params.id} does not exist!`);
        }
        
        const deletedVariation = doc.data();
        docRef.delete();
        return res.status(200).send(deletedVariation);
      });

      return null;

    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  })();
});

/**
 * POST /variations/:id/images
 */
routes.post('/:id/images', (req, res) => {
  (async () => {
    try {
      let newImages = [];

      // Check whether request body is an array of images, a single image, or neither
      try {

        if (Array.isArray(req.body)) {
          // Validate all image objects before adding
          for (const image of req.body) {
            console.log("image", image)
            const validation = variationImage.validate(image);

            // Throw error if image is invalid
            if (validation.error !== undefined) {
              throw validation.error;
            } else if (validation.errors !== undefined) {
              throw validation.errors;
            }

            newImages.push(image);
          }
        } else if (typeof req.body === "object") {
          // Validate single image
          // Note: validateAsync throws an error for you
          await variationImage.validateAsync(req.body);
          newImages.push(req.body);
        } else {
          return res.status(422).send('Error: body must be (array of) Variation image object(s)');
        }

      } catch (e) {
        // Schema validation errors end up here
        return res.status(422).send(e.details);
      }
    
      let images = [];
      const document = db.collection('variations').doc(req.params.id);
      const docRef = document;

      await document.get().then(doc => {
        if (!doc.exists) {
          return res.status(404).send(`Error: Variation id ${req.params.id} does not exist!`);
        }

        // Fetch original images and add new images
        images = doc.data().images;
        for (const newImage of newImages) {
          images.push(newImage);
        }

        docRef.update({images: images});
        return res.status(200).send(images);

      });

      return null;

    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  })();
})

/**
 * GET /variations/:id/images
 */
routes.get('/:id/images', (req, res) => {
  (async () => {
    try {
      const document = db.collection('variations').doc(req.params.id);
      
      await document.get().then(doc => {
        if (!doc.exists) {
          return res.status(404).send(`Error: Variation id ${req.params.id} does not exist!`);
        } else {
          return res.status(200).send(doc.data().images);
        }
      });

      return null;

    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  })();
});

/**
 * POST /variations/:id/description
 */
routes.post('/:id/description', (req, res) => {
  (async () => {
    try {
      let newParagraphs = [];
      
      // Check that the body is either string or array of strings, and
      // add body contents to 'additions' if valid
      if (typeof req.body === 'string' || req.body instanceof String) {
        newParagraphs.push(req.body);
      } else if (Array.isArray(req.body)) {
        await variationDescription.validateAsync(req.body);
        newParagraphs = req.body;
      } else {
        return res.status(422).send('Error: body must be string or array of strings');
      }

      const document = db.collection('variations').doc(req.params.id);
      const docRef = document;

      await document.get().then(doc => {
        if (!doc.exists) {
          return res.status(404).send(`Error: Variation id ${req.params.id} does not exist!`);
        }

        // Get the current description and add the additions
        let desc = doc.data().description;
        for (let paragraph of newParagraphs) {
          desc.push(paragraph);
        }

        // Update the description and send response
        docRef.update({description: desc});
        return res.status(200).send(desc);

      });

      return null;

    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  })();
})

/**
 * GET /variations/:id/description
 */
routes.get('/:id/description', (req, res) => {
  (async () => {
    try {
      const document = db.collection('variations').doc(req.params.id);
      
      await document.get().then(doc => {
        if (!doc.exists) {
          return res.status(404).send(`Error: Variation id ${req.params.id} does not exist!`);
        } else {
          return res.status(200).send(doc.data().description);
        }
      });

      return null;

    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  })();
})

module.exports = routes;
