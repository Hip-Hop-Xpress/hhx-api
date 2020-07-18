// Test file for Featured artist endpoints

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { INVALID_PARAMS, OK } = require('../errors/codes');
const { 
  INVALID_REQUEST_ERR, 
  DOC_NOT_FOUND_ERR, 
  DOC_ALRDY_EXISTS_ERR,
  IMMUTABLE_ATTR_ERR
} = require('../errors/types');

const base = '/v1/featured';
const numFeatured = 1;

let adminInitStub;
const functionsTest = test();

// Initialize the api before every test
beforeAll(async () => {
  adminInitStub = sinon.stub(admin, 'initializeApp');
});

// Clean up the api after every test
afterAll(async () => {
  adminInitStub.restore();
  functionsTest.cleanup();
});

/**
 * Featured Artist Endpoints Unit Tests
 * 
 * NOTE: all tests look at the production Firestore database
 */

// A test featured artist object with correct schema
// Used to test POST endpoints and errors
const testFeatured = {

};

// A test image object with correct schema
const testImage = {
  url: 'https://www.facebook.com',
  caption: 'this is just a test image',
};

// A test social media object with correct schema
const testSocial = {
  type: 'github',
  handle: 'Hip-Hop-Xpress',
  url: 'https://github.com/Hip-Hop-Xpress'
};

/**
 * GET endpoints tests
 * 
 * Checks basic GET functionality to work as expected
 */
describe('GET endpoints', () => {});

/**
 * GET endpoint tests with errors
 * These endpoints should send identical errors
 */
describe('GET endpoint errors', () => {});

/**
 * POST endpoint test
 * - create a mock artist
 * - retrieve the artist and verify contents
 * - delete the artist and verify again
 */
describe('POST/GET/DELETE endpoint test', () => {});

/**
 * POST /featured endpoint errors
 * - trying to post existing doc
 * - invalid schema
 */
describe('POST /featured endpoint errors', () => {});

/**
 * DELETE /featured endpoint errors
 * - trying to delete nonexistent doc
 */
describe('DELETE /featured endpoint errors', () => {});

/**
 * POST /bio endpoint errors
 * - sending empty strings
 */
describe('POST /bio endpoint errors', () => {});

/**
 * POST /images endpoint errors
 * - incorrect schema
 */
describe('POST /images endpoint errors', () => {});

/**
 * POST /socials endpoint errors
 * - incorrect schema
 */
describe('POST /socials endpoint errors', () => {});

/**
 * PUT /featured/:id test
 * - test for successful update of featured artist
 */
describe('PUT /featured/:id updates featured artist', () => {});

/**
 * PUT endpoint errors
 * - trying to update id
 * - incorrect schema
 */
describe('PUT endpoint errors', () => {});
