// Projects API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// Error handling functions/constants
const {
  sendExistingIdError,
  sendNonexistentIdError,
  sendIncorrectTypeError,
  sendSchemaValidationError,
} = require('../errors/helpers');

const wrap = require('../errors/wrap');
const { OK } = require('../errors/codes');

// Collection/doc name in Firestore
const collection = 'projects';
const docName = 'project';

/**
 * Schematics for Project data
 */
const projectString      = Joi.string().min(1);  // general non-empty string
const projectId          = Joi.number().integer().min(0);
const projectName        = projectString;
const projectStartDate   = Joi.string().min(4);
const projectEndDate     = Joi.string().min(4).allow(null);
const projectDescription = Joi.array().min(1).items(projectString.required());
const projectMembers     = Joi.array().min(1).items(projectString.required());
const projectIcon        = projectString;

// POST /projects schema
const postSchema = Joi.object({
  id:          projectId.required(),
  name:        projectName.required(),
  description: projectDescription.required(),
  members:     projectMembers.required(),
  startDate:   projectStartDate.required(),
  endDate:     projectEndDate.required(),
  icon:        projectIcon.required()
});

// PUT /projects/:id schema
const putSchema = Joi.object({
  id:          projectId,
  name:        projectName,
  description: projectDescription,
  members:     projectMembers,
  startDate:   projectStartDate,
  endDate:     projectEndDate,
  icon:        projectIcon
});

/**
 * Projects endpoints
 * 
 *   POST, GET               /projects
 *         GET, PUT, DELETE  /projects/:id
 *   POST, GET               /projects/:id/members
 *   POST, GET               /projects/:id/description
 * 
 * TODO: add support for query strings eventually
 */

 /**
  * POST /projects
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
      description: req.body.description,
      members: req.body.members,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      icon: req.body.icon
    });

  return res.status(OK).send(req.body);

}));

/**
 * GET /projects
 */
routes.get('/', wrap(async (req, res, next) => {
  
  // Query the collection and setup response
  let query = db.collection(collection);
  let response = [];

  // Get all documents from collection
  await query.get().then(snapshot => {
    let docs = snapshot.docs;

    for (let project of docs) {
      // Insert all data from server doc to response doc
      const selectedItem = {
        id: project.id,
        name: project.data().name,
        description: project.data().description,
        members: project.data().members,
        startDate: project.data().startDate,
        endDate: project.data().endDate,
        icon: project.data().icon
      };

      // Put the response doc into the response list
      response.push(selectedItem);
    }

    // Send the response once every doc has been put in
    return res.status(OK).send(response);
  });
  
}));

/**
 * GET /projects/:id
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
  });
    
}));

/**
 * PUT /projects/:id
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
 * DELETE /projects/:id
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
 * POST /projects/:id/description
 */
routes.post('/:id/description', wrap(async (req, res, next) => {
  
  let newParagraphs = [];
  
  // Check that the body is either string or array of strings, and
  // add body contents to 'additions' if valid
  if (typeof req.body === 'string' || req.body instanceof String) {
    newParagraphs.push(req.body);
  } else if (Array.isArray(req.body)) {
    await projectDescription.validateAsync(req.body);
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
 * GET /projects/:id/description
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
 * POST /projects/:id/members
 */
routes.post('/:id/members', wrap(async (req, res, next) => {
  
  let newParagraphs = [];
  
  // Check that the body is either string or array of strings, and
  // add body contents to 'additions' if valid
  if (typeof req.body === 'string' || req.body instanceof String) {
    newParagraphs.push(req.body);
  } else if (Array.isArray(req.body)) {
    await projectMembers.validateAsync(req.body);
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

    // Get the current members and add new members
    let members = doc.data().members;
    for (let paragraph of newParagraphs) {
      members.push(paragraph);
    }

    // Update the members and send response
    docRef.update({members: members});
    return res.status(OK).send(members);

  });

  // linting purposes
  return null;
  
}));

/**
 * GET /projects/:id/members
 */
routes.get('/:id/members', wrap(async (req, res, next) => {
  
  const document = db.collection(collection).doc(req.params.id);
  
  await document.get().then(doc => {
    if (doc.exists) {
      return res.status(OK).send(doc.data().members);
    } else {
      return sendNonexistentIdError(res, req.params.id, docName);
    }
  });

}));

module.exports = routes;
