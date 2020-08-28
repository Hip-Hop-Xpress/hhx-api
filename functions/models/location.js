// Location Object schema

const Joi = require('@hapi/joi');

/**
 * Schematics for location
 */
const locationName = Joi.string().min(1);
const locationLat  = Joi.number().min(-90).max(90);
const locationLng  = Joi.number().min(-180).max(180);

const locationSchema = Joi.object({
  name:      locationName,
  latitude:  locationLat,
  longitude: locationLng
});

module.exports = {
  locationSchema
};
