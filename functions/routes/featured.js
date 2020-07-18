// Featured artists API route

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
const collection = 'featured';
const docName = 'featured artist';

/**
 * Schematics for Project data
 */
const featuredString         = Joi.string().min(1);  // general non-empty string
const featuredId             = Joi.number().integer().min(0);
const featuredName           = featuredString;
const featuredDate           = Joi.string().min(4);
const featuredBio            = Joi.array().min(1).items(featuredString.required());
const featuredHeaderImageUrl = Joi.string().uri();

// Image schematics
const featuredImage  = Joi.object({
                         url:     Joi.string().uri().required(),
                         caption: Joi.string().allow("").required(),
                       });
const featuredImages = Joi.array().items(featuredImage);

// Social media schematics
const socialTypeRegex = new RegExp('^(angellist|codepen|envelope|etsy|facebook|flickr|foursquare|github-alt|github|gitlab|instagram|linkedin|medium|pinterest|quora|reddit-alien|soundcloud|stack-overflow|steam|stumbleupon|tumblr|twitch|twitter|google|google-plus-official|vimeo|vk|weibo|wordpress|youtube)$');
const featuredSocial  = Joi.object({
                          type: Joi.string().regex(socialTypeRegex),
                          handle: featuredString,
                          url: Joi.string().uri().required()
                        });

// POST /featured schema
const postSchema = Joi.object({
  id:             featuredId.required(),
  name:           featuredName.required(),
  date:           featuredDate.required(),
  bio:            featuredBio.required(),
  headerImageUrl: featuredHeaderImageUrl.required(),
  images:         featuredImages.required(),
  social:         featuredSocial.required()
});

// PUT /featured/:id schema
const putSchema = Joi.object({
  name:           featuredName,
  date:           featuredDate,
  bio:            featuredBio,
  headerImageUrl: featuredHeaderImageUrl,
  images:         featuredImages,
  social:         featuredSocial
});

/**
 * Featured artists endpoints
 * 
 *   POST, GET               /featured
 *         GET, PUT, DELETE  /featured/:id
 *   POST, GET               /featured/:id/bio
 *   POST, GET               /featured/:id/images
 *   POST, GET               /featured/:id/socials
 * 
 * TODO: add support for query strings eventually
 */

 /**
  * POST /featured
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
    await db.collection(collection).doc(`/${req.body.id}/`)
      .create({
        id: req.body.id,
        name: req.body.name,
        description: req.body.description,
        members: req.body.members,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        icon: req.body.icon
      });
  } catch (e) {
    return sendExistingIdError(res, req.body.id, docName);
  }
  
  return res.status(OK).send(req.body);

}));

/**
 * GET /featured
 */
routes.get('/', wrap(async (req, res, next) => {
  
  // Query the collection and setup response
  let query = db.collection(collection);
  let response = [];

  // Get all documents from collection
  await query.get().then(snapshot => {
    let docs = snapshot.docs;

    for (let featured of docs) {
      // Insert all data from server doc to response doc
      const selectedItem = {
        id: featured.id,
        name: featured.data().name,
        description: featured.data().description,
        members: featured.data().members,
        startDate: featured.data().startDate,
        endDate: featured.data().endDate,
        icon: featured.data().icon
      };

      // Put the response doc into the response list
      response.push(selectedItem);
    }

    // Send the response once every doc has been put in
    return res.status(OK).send(response);
  });
  
}));

/**
 * GET /featured/:id
 */
routes.get('/:id', wrap(async (req, res, next) => {
  
  const document = db.collection(collection).doc(req.params.id);

  await document.get().then(doc => {
    if (doc.exists) {
      // Fetch and send data if featured of :id is found
      let response = doc.data();
      return res.status(OK).send(response);
    } else {
      // If ID is not found, send error response
      return sendNonexistentIdError(res, req.params.id, docName);
    }
  });
    
}));

/**
 * PUT /featured/:id
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
 * DELETE /featured/:id
 */
routes.delete('/:id', wrap(async (req, res, next) => {
  
  const document = db.collection(collection).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
    
    const deletedProject = doc.data();
    docRef.delete();
    return res.status(OK).send(deletedProject);
  });

}));

/**
 * POST /featured/:id/bio
 */
routes.post('/:id/bio', wrap(async (req, res, next) => {
  
  let newParagraphs = [];
  
  // Check that the body is either string or array of strings, and
  // add body contents to 'additions' if valid
  if (typeof req.body === 'string' || req.body instanceof String) {
    newParagraphs.push(req.body);
  } else if (Array.isArray(req.body)) {
    await featuredBio.validateAsync(req.body);
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

    // Get the current bio and add the additions
    let newBio = doc.data().bio;
    for (let paragraph of newParagraphs) {
      newBio.push(paragraph);
    }

    // Update the bio and send response
    docRef.update({bio: newBio});
    return res.status(OK).send(newBio);

  });

  // linting purposes
  return null;
    
}));

/**
 * GET /featured/:id/bio
 */
routes.get('/:id/bio', wrap(async (req, res, next) => {
  
  const document = db.collection(collection).doc(req.params.id);
  
  await document.get().then(doc => {
    if (doc.exists) {
      return res.status(OK).send(doc.data().bio);
    } else {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
  });

}));

/**
 * POST /featured/:id/images
 */
routes.post('/:id/images', wrap(async (req, res, next) => {

}));

 /**
 * GET /featured/:id/images
 */
routes.get('/:id/images', wrap(async (req, res, next) => {

}));

 /**
 * POST /featured/:id/socials
 */
routes.post('/:id/socials', wrap(async (req, res, next) => {

}));

 /**
 * GET /featured/:id/socials
 */
routes.get('/:id/socials', wrap(async (req, res, next) => {

}));

module.exports = routes;
