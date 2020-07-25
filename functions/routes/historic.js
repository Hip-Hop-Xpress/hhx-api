// Historic artists API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Error handling functions/constants
const {
  sendImmutableAttributeError,
  sendExistingIdError,
  sendNonexistentIdError,
  sendIncorrectTypeError,
  sendSchemaValidationError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');

// Collection/doc name in Firestore
const collection = 'historic';
const docName = 'historic artist';

/**
 * Schematics for Participant data
 */
const historicId          = Joi.number().integer().min(0);
const historicName        = Joi.string().min(1);
const historicBorn        = Joi.string().min(4);
const historicDied        = Joi.string().min(4).allow(null);
const historicDescription = Joi.array().min(1).items(Joi.string().required());
const historicImage       = Joi.object({
                               url:            Joi.string().uri().required(),
                               caption:        Joi.string().allow("").required(),
                            });
const historicImages      = Joi.array().min(1).items(historicImage);
                            

/**
 * POST /historics schema
 */
const postSchema = Joi.object({
  id:          historicId.required(),
  name:        historicName.required(),
  born:        historicBorn.required(),
  died:        historicDied.required(),
  description: historicDescription.required(),
  images:      historicImages.required()
});

// PUT /historics/:id schema
const putSchema = Joi.object({
  name:        historicName,
  born:        historicBorn,
  died:        historicDied,
  description: historicDescription,
  images:      historicImages
});

/**
 * Participants endpoints
 * 
 *   POST, GET               /historics
 *         GET, PUT, DELETE  /historics/:id
 *   POST, GET               /historics/:id/images
 *   POST, GET               /historics/:id/description
 * 
 * TODO: add support for query strings eventually
 */

/**
 * POST /historics
 */
routes.post('/', wrap(async (req, res, next) => {

  // Validate request body using schema
  try {
    await postSchema.validateAsync(req.body);
  } catch (e) {
    return sendSchemaValidationError(res, e);
  }
  
  // Try creating a document, and throw error if the doc exists
  try {
    await db.collection(collection).doc(`/${req.body.id}/`).create(req.body);
  } catch (e) {
    return sendExistingIdError(res, req.body.id, docName);
  }
  
  return res.status(OK).send(req.body);

}));

/**
 * GET /historics
 */
routes.get('/', wrap(async (req, res, next) => {

  // Query the collection and setup response
  let query = db.collection(collection);
  let response = [];

  // Get all documents from collection
  await query.get().then(snapshot => {
    let docs = snapshot.docs;

    for (let historic of docs) {
      response.push(historic.data());
    }

    // Send the response once every doc has been put in
    return res.status(OK).send(response);
  });

}));

/**
 * GET /historics/:id
 */
routes.get('/:id', wrap(async (req, res, next) => {

  const document = db.collection(collection).doc(req.params.id);

  await document.get().then(doc => {
      if (doc.exists) {
        // Fetch and send data if historic of :id is found
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
 * PUT /historics/:id
 */
routes.put('/:id', wrap(async (req, res, next) => {

  // Validate request body for correct schema
  try {
    await putSchema.validateAsync(req.body);
  } catch (e) {
    // If client tries updating id, send immutable attribute error
    if (e.details[0].context.key === 'id') {
      return sendImmutableAttributeError(res, 'id');
    }
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
 * DELETE /historics/:id
 */
routes.delete('/:id', wrap(async (req, res, next) => {
  
  const document = db.collection(collection).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
    
    const deletedParticipant = doc.data();
    docRef.delete();
    return res.status(OK).send(deletedParticipant);
  });

}));

/**
 * POST /historics/:id/images
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
        const validation = historicImage.validate(image);

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
      await historicImage.validateAsync(req.body);
      newImages.push(req.body);
    } else {
      // Send error if request body is incorrect type
      return sendIncorrectTypeError(
        res, 
        'Request body must be (array of) Participant image object(s)'
      );
    }

  } catch (e) {
    // Schema validation errors end up here
    return sendSchemaValidationError(res, e);
  }
  
  // Once all images have been validated, add them to the historic with id
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
 * GET /historics/:id/images
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
 * POST /historics/:id/description
 */
routes.post('/:id/description', wrap(async (req, res, next) => {

  let newParagraphs = [];
  
  // Check that the body is either string or array of strings, and
  // add body contents to 'additions' if valid
  if (typeof req.body === 'string' || req.body instanceof String) {
    newParagraphs.push(req.body);
  } else if (Array.isArray(req.body)) {
    await historicDescription.validateAsync(req.body);
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
 * GET /historics/:id/description
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
