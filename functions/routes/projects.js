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

// Collection name in Firestore
const collection = 'projects';

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

module.exports = routes;