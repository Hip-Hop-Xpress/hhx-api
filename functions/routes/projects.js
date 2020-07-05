// Projects API route

const Joi = require('@hapi/joi');
const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

const httpCodes = require('../errors/codes');
const errorTypes = require('../errors/types');

/**
 * Schematics for Project data
 */
const projectString      = Joi.string().min(1);  // general non-empty string
const projectId          = Joi.number().integer().min(0);
const projectName        = projectString;
const projectStartDate   = Joi.string().min(4);
const projectEndDate     = Joi.string().min(4);
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

// PUT /variations/:id schema
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

module.exports = routes;
