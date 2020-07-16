// Helper functions for constructing different error responses
// TODO: should probably make custom Error classes for this...

const errorTypes = require('./types');
const httpCodes = require('./codes');

/**
 * Sends error response when a nonexistent ID is requested
 * 
 * @param {Response} res the error Response to be sent
 * @param {number} id an invalid ID (doesn't point to document)
 * @param {String} docName name of document in collection 
 * @returns {Response} the response with correct status and body
 */
const sendNonexistentIdError = (res, id, docName) => {

  const errorResponse = {
    type: errorTypes.DOC_NOT_FOUND_ERR,
    code: httpCodes.INVALID_PARAMS.toString(),
    message: `The requested ${docName} with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  return res.status(httpCodes.INVALID_PARAMS).send(errorResponse);

}

/**
 * Sends error response when a nonexistent document is requested
 * 
 * @param {Response} res the error Response to be sent
 * @param {String} paramName name of identifier attribute
 * @param {number|String} param an identifier that doesn't point to a document
 * @param {String} docName name of document in collection 
 * @returns {Response} the response with correct status and body
 */
const sendNonexistentDocError = (res, paramName, param, docName) => {

  const errorResponse = {
    type: errorTypes.DOC_NOT_FOUND_ERR,
    code: httpCodes.INVALID_PARAMS.toString(),
    message: `The requested ${docName} with ${paramName}: "${param}" does not exist!`,
    param: paramName,
    original: null
  };

  return res.status(httpCodes.INVALID_PARAMS).send(errorResponse);

}

/**
 * Sends error response when a request tries creating a
 * document that already exists
 * 
 * @param {Response} res the error Response to be sent
 * @param {number} id an invalid ID (already points to document)
 * @param {String} docName name of document in collection 
 * @returns {Response} the response with correct status and body
 */
const sendExistingIdError = (res, id, docName) => {

  const errorResponse = {
    type: errorTypes.DOC_ALRDY_EXISTS_ERR,
    code: httpCodes.INVALID_PARAMS.toString(),
    message: `The requested ${docName} with id ${id} already exists!`,
    param: 'id',
    original: null
  };

  return res.status(httpCodes.INVALID_PARAMS).send(errorResponse);

}

/**
 * Sends error response when a request tries creating a document that already exists
 * 
 * @param {Response} res the error Response to be sent
 * @param {String} paramName name of identifier attribute
 * @param {number} param an invalid identifer (already points to document)
 * @param {String} docName name of document in collection 
 * @returns {Response} the response with correct status and body
 */
const sendExistingDocError = (res, paramName, param, docName) => {

  const errorResponse = {
    type: errorTypes.DOC_ALRDY_EXISTS_ERR,
    code: httpCodes.INVALID_PARAMS.toString(),
    message: `The requested ${docName} with ${paramName}: "${param}" already exists!`,
    param: paramName,
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
 * Sends an immutable attribute error when trying to
 * update an immutable attribute
 * 
 * @param {Response} res the error Response to be esnt
 * @param {String} attribute name of immutable attribute
 * @returns {Response} the response with correct status and body 
 */
const sendImmutableAttributeError = (res, attribute) => {

  const errorResponse = {
    type: errorTypes.IMMUTABLE_ATTR_ERR,
    code: httpCodes.INVALID_PARAMS.toString(),
    message: `The attribute "${attribute}" is immutable and cannot be updated!`,
    param: attribute,
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

  console.error(e);  // is meant to be here, NOT for testing

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
  sendExistingIdError,
  sendNonexistentDocError,
  sendExistingDocError,
  sendSchemaValidationError,
  sendIncorrectTypeError,
  constructServerError
};
