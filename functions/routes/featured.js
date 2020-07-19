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
  sendExistingDocError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK, SERVER_ERR } = require('../errors/codes');

// Collection/doc name in Firestore
const collection = 'featured';
const docName = 'featured artist';

/**
 * Schematics for Featured artist data
 */
const featuredString         = Joi.string().min(1);  // general non-empty string
const featuredId             = Joi.number().integer().min(0);
const featuredName           = featuredString;
const featuredDate           = Joi.string().min(4);
const featuredCurrent        = Joi.bool().disallow('yes', 'no');
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
const featuredSocials = Joi.array().min(1).items(featuredSocial);

// POST /featured schema
const postSchema = Joi.object({
  id:             featuredId.required(),
  name:           featuredName.required(),
  date:           featuredDate.required(),
  current:        featuredCurrent.required(),
  bio:            featuredBio.required(),
  headerImageUrl: featuredHeaderImageUrl.required(),
  images:         featuredImages.required(),
  socials:        featuredSocials.required()
});

// PUT /featured/:id schema
const putSchema = Joi.object({
  name:           featuredName,
  date:           featuredDate,
  current:        featuredCurrent,
  bio:            featuredBio,
  headerImageUrl: featuredHeaderImageUrl,
  images:         featuredImages,
  socials:        featuredSocials
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
    // If the type is not valid, send a special error message
    if (e.details[0].context.key === 'type') {
      return sendIncorrectTypeError(
        res,
        `"${e.details[0].context.value}" is not one of the social media types for react-native-elements social icon: https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type`,
        'type'
      );
    }
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
      response.push(featured.data());
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
    
    const deletedFeatured = doc.data();
    docRef.delete();
    return res.status(OK).send(deletedFeatured);
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
  
  // Initialize list of images to add
  let newImages = [];

  // Check whether request body is an array of images, 
  // a single image, or neither
  try {

    if (Array.isArray(req.body)) {
      // Validate all image objects before adding
      for (const image of req.body) {
        const validation = featuredImage.validate(image);

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
      await featuredImage.validateAsync(req.body);
      newImages.push(req.body);
    } else {
      // Send error if request body is incorrect type
      return sendIncorrectTypeError(
        res, 
        'Request body must be (array of) Featured Artist image object(s)'
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
 * GET /featured/:id/images
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
 * POST /featured/:id/socials
 */
routes.post('/:id/socials', wrap(async (req, res, next) => {
  
  // Initialize list of images to add
  let newSocials = [];

  // Check whether request body is an array of images, 
  // a single image, or neither
  try {

    if (Array.isArray(req.body)) {
      // Validate all image objects before adding
      for (const social of req.body) {
        const validation = featuredSocial.validate(social);

        // Throw error if image is invalid
        if (validation.error !== undefined) {
          throw validation.error;
        } else if (validation.errors !== undefined) {
          throw validation.errors;
        }

        newSocials.push(social);
      }
    } else if (typeof req.body === "object") {
      // Validate single image
      // Note: validateAsync throws an error for you
      await featuredSocial.validateAsync(req.body);
      newSocials.push(req.body);
    } else {
      // Send error if request body is incorrect type
      return sendIncorrectTypeError(
        res, 
        'Request body must be (array of) Social media object(s)'
      );
    }

  } catch (e) {
    // Schema validation errors end up here

    // If the type is not valid, send a special error message
    if (e.details[0].context.key === 'type') {
      return sendIncorrectTypeError(
        res,
        `"${e.details[0].context.value}" is not one of the social media types for react-native-elements social icon: https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type`,
        'type'
      );
    }
    
    // Otherwise send a normal schema error
    return sendSchemaValidationError(res, e);
  }
  
  // Once all socials have been validated, add them to the variation with id
  let socials = [];
  const document = db.collection(collection).doc(req.params.id);
  const docRef = document;

  await document.get().then(doc => {
    if (!doc.exists) {
      return sendNonexistentIdError(res, req.params.id, docName);
    }

    socials = doc.data().socials;

    // Add new socials
    for (const newSocial of newSocials) {
      // If a social of the same type already exists, throw error
      for (const existingSocial of doc.data().socials) {
        if (newSocial.type === existingSocial.type) {
          return sendExistingDocError(res, 'type', newSocial.type, docName);
        }
      }

      socials.push(newSocial);
    }

    docRef.update({socials: socials});
    return res.status(OK).send(socials);

  });

  // linting purposes
  return null;

}));

/**
 * GET /featured/:id/socials
 */
routes.get('/:id/socials', wrap(async (req, res, next) => {
  
  const document = db.collection(collection).doc(req.params.id);
  
  await document.get().then(doc => {
    if (doc.exists) {
      return res.status(OK).send(doc.data().socials);
    } else {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
  });

}));

module.exports = routes;
