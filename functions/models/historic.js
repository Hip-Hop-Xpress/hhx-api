// Historic artists Object schema

const Joi = require('@hapi/joi');

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

module.exports = {
  postSchema,
  putSchema,
  historicImage,
  historicDescription,
};
