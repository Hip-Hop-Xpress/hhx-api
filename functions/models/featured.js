// Featured artist Object schema

const Joi = require('@hapi/joi');
const socialTypeRegex = require('./socialTypes');

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

module.exports = {
  postSchema,
  putSchema,
  featuredBio,
  featuredImage,
  featuredSocial,
};
