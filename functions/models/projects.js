// Projects Object schema

const Joi = require('@hapi/joi');

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
  name:        projectName,
  description: projectDescription,
  members:     projectMembers,
  startDate:   projectStartDate,
  endDate:     projectEndDate,
  icon:        projectIcon
});

module.exports = {
  postSchema,
  putSchema,
  projectDescription,
  projectMembers,
};
