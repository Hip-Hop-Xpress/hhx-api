const errorTypes = require('./types');
const httpCodes = require('./codes');

/**
 * Sends error response when a nonexistent ID is requested
 * 
 * @param {Response} res the error Response to be sent
 * @param {number} id an invalid ID (doesn't point to variation)
 * @returns {Response} the response with correct status and body
 */
const sendNonexistentIdError = (res, id) => {
  const errorResponse = {
    type: errorTypes.ID_NOT_FOUND_ERR,
    code: httpCodes.INVALID_PARAMS.toString(),
    message: `The requested variation with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  return res.status(httpCodes.INVALID_PARAMS).send(errorResponse);
}

/**
 * Sends error notifying user of invalid request according to schema
 * Param 'e' must be a Joi schema validation error
 * 
 * @param {Response} res the error Response to be sent
 * @param {Object} e a Joi schema validation error
 * @returns {Response} the response with correct status and body
 */
const sendSchemaValidationError = (res, e) => {
  // Cherry pick information from Joi schema validation error
  const schemaError = e.details[0];

  const errorResponse = {
    type: errorTypes.INVALID_REQUEST_ERR,
    code: httpCodes.INVALID_PARAMS.toString(),
    message: schemaError.message,
    param: schemaError.context.key,
    original: null,
  };

  return res.status(httpCodes.INVALID_PARAMS).send(errorResponse);
}

/**
 * Sends an invalid params/request error with given message
 * 
 * @param {Response} res the error Response to be sent
 * @param {String} message error message about correct type to include
 * @returns {Response} the response with correct status and body
 */
const sendIncorrectTypeError = (res, message) => {
  const errorResponse = {
    type: errorTypes.INVALID_REQUEST_ERR,
    code: httpCodes.INVALID_PARAMS.toString(),
    message: message,
    param: null,
    original: null
  };

  return res.status(httpCodes.INVALID_PARAMS).send(errorResponse);
}

/**
 * Sends and logs an error response upon catching an unknown error
 * 
 * @param {Response} res the error Response to be sent
 * @param {Object} e the unknown error thrown
 * @returns {Response} the response with correct status and body
 */
const constructServerError = (res, e) => {
  console.log(e);  // is meant to be here, NOT for testing

  const errorResponse = {
    type: errorTypes.API_ERR,
    code: httpCodes.SERVER_ERR.toString(),
    message: 'An uncaught error was thrown. See "original" for details',
    param: null,
    original: e,
  };

  return res.status(httpCodes.SERVER_ERR).send(errorResponse);
}

module.exports = {
  sendNonexistentIdError,
  sendSchemaValidationError,
  sendIncorrectTypeError,
  constructServerError
};
