// Participants Object schema

const Joi = require('@hapi/joi');

/**
 * Schematics for Participant data
 */
const participantId          = Joi.number().integer().min(0);
const participantName        = Joi.string().min(1);
const participantDescription = Joi.array().min(1).items(Joi.string().required());
const participantImage       = Joi.object({
                               url:            Joi.string().uri().required(),
                               caption:        Joi.string().allow("").required(),
                            });
const participantImages      = Joi.array().min(1).items(participantImage);
                            

/**
 * POST /participants schema
 */
const postSchema = Joi.object({
  id:          participantId.required(),
  name:        participantName.required(),
  description: participantDescription.required(),
  images:      participantImages.required()
});

// PUT /participants/:id schema
const putSchema = Joi.object({
  name:        participantName,
  description: participantDescription,
  images:      participantImages
});

module.exports = {
  postSchema,
  putSchema,
  participantImage,
  participantDescription,
};
