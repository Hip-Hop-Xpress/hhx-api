// Variations API route

const Joi = require('@hapi/joi');

/**
 * Schematics for Variation data
 */
const variationId          = Joi.number().integer().min(0);
const variationName        = Joi.string().min(1);
const variationDate        = Joi.string().min(4);
const variationDescription = Joi.array().min(1).items(Joi.string().required());
const variationImage       = Joi.object({
                               url:            Joi.string().uri().required(),
                               caption:        Joi.string().allow("").required(),
                               componentImage: Joi.bool().required()
                            });
const variationImages      = Joi.array().min(1).items(variationImage);
                            
/**
 * POST /variations schema
 */
const postSchema = Joi.object({
  id:          variationId.required(),
  name:        variationName.required(),
  date:        variationDate.required(),
  description: variationDescription.required(),
  images:      variationImages.required()
});

// PUT /variations/:id schema
const putSchema = Joi.object({
  name:        variationName,
  date:        variationDate,
  description: variationDescription,
  images:      variationImages
});

module.exports = {
  postSchema,
  putSchema,
  variationImage,
  variationDescription,
};
