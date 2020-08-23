// Courses Object Schema

const Joi = require('@hapi/joi');

const courseString      = Joi.string().min(1);  // general non-empty string
const courseId          = Joi.number().integer().min(0);
const courseName        = courseString;
const courseStartDate   = Joi.string().min(4);
const courseEndDate     = Joi.string().min(4).allow(null);
const courseDescription = Joi.array().min(1).items(courseString.required());
const courseImage       = Joi.object({
                            url:     Joi.string().uri().required(),
                            caption: Joi.string().allow("").required(),
                          });
const courseImages      = Joi.array().items(courseImage);

// POST /courses schema
const postSchema = Joi.object({
  id:          courseId.required(),
  name:        courseName.required(),
  description: courseDescription.required(),
  images:      courseImages.required(),
  startDate:   courseStartDate.required(),
  endDate:     courseEndDate.required(),
});

// PUT /courses/:id schema
const putSchema = Joi.object({
  name:        courseName,
  description: courseDescription,
  images:      courseImages,
  startDate:   courseStartDate,
  endDate:     courseEndDate,
});

module.exports = {
  postSchema,
  putSchema
};
