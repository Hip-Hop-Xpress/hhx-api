// Variations API route

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

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');

// Collection/doc name in Firestore
const collection = 'variations';
const docName = 'variation';

/**
 * Schematics for Variation data
 * TODO: move some of the generic ones to the ../schema folder
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
 */

/**
 * POST /variations
 */
routes.post('/', wrap(async (req, res, next) => {

  // Validate request body using schema
  try {
    await postSchema.validateAsync(req.body);
  } catch (e) {
    return sendSchemaValidationError(res, e);
  }
  
  await db.collection(collection).doc(`/${req.body.id}/`)
    .create({
      id: req.body.id,
      name: req.body.name,
      date: req.body.date,
      description: req.body.description,
      images: req.body.images,
    });

  return res.status(OK).send(req.body);

}));

/**
 * GET /variations
 */
routes.get('/', wrap(async (req, res, next) => {

  // Query the collection and setup response
  let query = db.collection(collection);
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
    return res.status(OK).send(response);
  });

}));

/**
 * GET /variations/:id
 */
routes.get('/:id', wrap(async (req, res, next) => {

  const document = db.collection(collection).doc(req.params.id);

  await document.get().then(doc => {
      if (doc.exists) {
        // Fetch and send data if variation of :id is found
        let response = doc.data();
        return res.status(OK).send(response);
      } else {
        // If ID is not found, send error response
        return sendNonexistentIdError(res, req.params.id, docName);
      }
    }
  );
    
}));

/**
 * PUT /variations/:id
 */
routes.put('/:id', wrap(async (req, res, next) => {

  // Validate request body for correct schema
  try {
    await putSchema.validateAsync(req.body);
  } catch (e) {
    return sendSchemaValidationError(res, e);
  }

  const document = db.collection(collection).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }

    docRef.update(req.body);

    // Spread operator to combine old data with updated data
    // Shared fields are overwritten by rightmost object (updated data)
    return res.status(OK).send({...doc.data(), ...req.body});

  });

  // linting purposes
  return null;

}));

/**
 * DELETE /variations/:id
 */
routes.delete('/:id', wrap(async (req, res, next) => {
  
  const document = db.collection(collection).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
    
    const deletedVariation = doc.data();
    docRef.delete();
    return res.status(OK).send(deletedVariation);
  });

}));

/**
 * POST /variations/:id/images
 */
routes.post('/:id/images', wrap(async (req, res, next) => {

  // Initialize list of images to add
  let newImages = [];

  // Check whether request body is an array of images, 
  // a single image, or neither
  try {

    if (Array.isArray(req.body)) {
      // Validate all image objects before adding
      for (const image of req.body) {
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
      // Send error if request body is incorrect type
      return sendIncorrectTypeError(
        res, 
        'Request body must be (array of) Variation image object(s)'
      );
    }

  } catch (e) {
    // Schema validation errors end up here
    return sendSchemaValidationError(res, e);
  }
  
  // Once all images have been validated, add them to the variation with id
  let images = [];
  const document = db.collection(collection).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }

    // Fetch original images and add new images
    images = doc.data().images;

    for (const newImage of newImages) {
      images.push(newImage);
    }

    docRef.update({images: images});
    return res.status(OK).send(images);

  });

  // linting purposes
  return null;

}));

/**
 * GET /variations/:id/images
 */
routes.get('/:id/images', wrap(async (req, res, next) => {

  const document = db.collection(collection).doc(req.params.id);
  
  await document.get().then(doc => {
    if (doc.exists) {
      return res.status(OK).send(doc.data().images);
    } else {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
  });

}));

/**
 * POST /variations/:id/description
 */
routes.post('/:id/description', wrap(async (req, res, next) => {

  let newParagraphs = [];
  
  // Check that the body is either string or array of strings, and
  // add body contents to 'additions' if valid
  if (typeof req.body === 'string' || req.body instanceof String) {
    newParagraphs.push(req.body);
  } else if (Array.isArray(req.body)) {
    await variationDescription.validateAsync(req.body);
    newParagraphs = req.body;
  } else {
    return sendIncorrectTypeError(res, 'Body must be string or array of strings');
  }

  const document = db.collection(collection).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }

    // Get the current description and add the additions
    let desc = doc.data().description;
    for (let paragraph of newParagraphs) {
      desc.push(paragraph);
    }

    // Update the description and send response
    docRef.update({description: desc});
    return res.status(OK).send(desc);

  });

  // linting purposes
  return null;
    
}));

/**
 * GET /variations/:id/description
 */
routes.get('/:id/description', wrap(async (req, res, next) => {

  const document = db.collection(collection).doc(req.params.id);
  
  await document.get().then(doc => {
    if (doc.exists) {
      return res.status(OK).send(doc.data().description);
    } else {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
  });

}));

module.exports = routes;
