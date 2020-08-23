// Courses API route

const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Error handling functions/constants
const {
  sendExistingIdError,
  sendNonexistentIdError,
  sendIncorrectTypeError,
  sendSchemaValidationError,
  sendImmutableAttributeError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');

const { postSchema, putSchema } = require('../models/courses');

// Collection/doc name in Firestore
const collection = 'courses';
const docName = 'course';

/**
 * Courses endpoints
 * 
 *   POST, GET               /courses
 *         GET, PUT, DELETE  /courses/:id
 *   POST, GET               /courses/:id/images
 *   POST, GET               /courses/:id/description
 * 
 * TODO: add support for query strings eventually
 */

 /**
  * POST /courses
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
 * GET /courses
 */
routes.get('/', wrap(async (req, res, next) => {
  
  // Query the collection and setup response
  let query = db.collection(collection);
  let response = [];

  // Get all documents from collection
  await query.get().then(snapshot => {
    let docs = snapshot.docs;

    for (let course of docs) {
      // Put the response doc into the response list
      response.push(course.data());
    }

    // Send the response once every doc has been put in
    return res.status(OK).send(response);
  });
  
}));

/**
 * GET /courses/:id
 */
routes.get('/:id', wrap(async (req, res, next) => {
  
  const document = db.collection(collection).doc(req.params.id);

  await document.get().then(doc => {
    if (doc.exists) {
      // Fetch and send data if course of :id is found
      let response = doc.data();
      return res.status(OK).send(response);
    } else {
      // If ID is not found, send error response
      return sendNonexistentIdError(res, req.params.id, docName);
    }
  });
    
}));

/**
 * PUT /courses/:id
 */
routes.put('/:id', wrap(async (req, res, next) => {
  
  try {

    // Validate request body for correct schema
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
 * DELETE /courses/:id
 */
routes.delete('/:id', wrap(async (req, res, next) => {
  
  const document = db.collection(collection).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
    
    const deletedCourse = doc.data();
    docRef.delete();
    return res.status(OK).send(deletedCourse);
  });

}));

/**
 * POST /courses/:id/description
 */
routes.post('/:id/description', wrap(async (req, res, next) => {
  
  let newParagraphs = [];
  
  // Check that the body is either string or array of strings, and
  // add body contents to 'additions' if valid
  if (typeof req.body === 'string' || req.body instanceof String) {
    newParagraphs.push(req.body);
  } else if (Array.isArray(req.body)) {
    await courseDescription.validateAsync(req.body);
    newParagraphs = req.body;
  } else {
    return sendIncorrectTypeError(res, 'Request body must be string or array of strings');
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
 * GET /courses/:id/description
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

/**
 * POST /courses/:id/images
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
        const validation = courseImage.validate(image);

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
      await courseImage.validateAsync(req.body);
      newImages.push(req.body);
    } else {
      // Send error if request body is incorrect type
      return sendIncorrectTypeError(
        res, 
        'Request body must be (array of) Course image object(s)'
      );
    }

  } catch (e) {
    // Schema validation errors end up here
    return sendSchemaValidationError(res, e);
  }
  
  // Once all images have been validated, add them to the course with id
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
 * GET /courses/:id/images
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

module.exports = routes;
