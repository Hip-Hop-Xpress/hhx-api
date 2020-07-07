// Projects API route

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
 *         GET, PUT, DELETE  /projects/:id TODO:
 *   POST, GET               /projects/:id/members TODO:
 *   POST, GET               /projects/:id/description TODO:
 * 
 * TODO: add support for query strings eventually
 */

 /**
  * POST /projects
  */
routes.post('/', (req, res) => {
  (async () => {

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

  })();
});

/**
 * GET /projects
 */
routes.get('/', (req, res) => {
  (async () => {

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

  })();
});

/**
 * GET /projects/:id
 */
routes.get('/:id', (req, res) => {
  (async () => {

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
    
  })();
});

/**
 * PUT /projects/:id
 */
routes.put('/:id', (req, res) => {
  (async () => {

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

  })();
});

/**
 * DELETE /projects/:id
 */
routes.delete('/:id', (req, res) => {
  (async () => {
  
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

  })();
});

/**
 * GET /projects/:id/description
 */
routes.get('/:id/description', (req, res) => {
  (async () => {

    const document = db.collection(collection).doc(req.params.id);
    
    await document.get().then(doc => {
      if (doc.exists) {
        return res.status(OK).send(doc.data().description);
      } else {
        return sendNonexistentIdError(res, req.params.id, docName);
      }
    });

  })();
});

/**
 * GET /projects/:id/members
 */
routes.get('/:id/members', (req, res) => {
  (async () => {

    const document = db.collection(collection).doc(req.params.id);
    
    await document.get().then(doc => {
      if (doc.exists) {
        return res.status(OK).send(doc.data().members);
      } else {
        return sendNonexistentIdError(res, req.params.id, docName);
      }
    });

  })();
});

module.exports = routes;
