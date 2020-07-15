// Test file for Social media endpoints

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { OK, INVALID_PARAMS } = require('../errors/codes');
const { INVALID_REQUEST_ERR, ID_NOT_FOUND_ERR, ID_ALREADY_EXISTS } = require('../errors/types');
const base = '/v1/socials';
const numSocials = 4;

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
 * Social Media Endpoints Unit Tests
 * 
 * NOTE: all tests use the production Firestore database
 * 
 */

// Test social media object with correct schema
const testSocial = {
  type: 'github',
  handle: 'Hip-Hop-Xpress',
  url: 'https://github.com/Hip-Hop-Xpress'
};

/**
 * GET endpoints tests
 * NOTE: assumes that all current HHX social medias are in the database
 */
describe('GET endpoints', () => {});

/**
 * GET endpoints error tests
 * Only error should be getting nonexistent type
 */
describe('GET endpoints errors', () => {});

/**
 * POST endpoint tests
 *
 * This test suite:
 * - creates a mock social in the database
 * - deletes mock social afterwards
 * 
 */
describe('POST endpoint tests (tests /DELETE too)', () => {});

/**
 * POST/DELETE /socials endpoint errors
 * - schema errors
 * - nonexistent type errors (DELETE)
 * - already existing type errors (POST)
 * - type is not valid (see: https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type)
 */
describe('POST/DELETE socials endpoint errors', () => {});

/**
 * PUT tests for socials
 */
describe('PUT /v1/socials/:type updates social', () => {

  const initialSocial = {
    type: 'google',
    handle: 'hhx',
    url: 'https://www.google.com/'
  };

  const updatedSocial = {
    type: initialSocial.type,
    handle: 'the_updated_hhx',
    url: 'https://images.google.com/'
  };

  // PUT and DELETE operations all use this endpoint
  const endpoint = `${base}/${initialSocial.type}`;

  // POST the social before testing PUT operations
  beforeAll(async () => {

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(initialProject)
      .expect(OK);

  });

  // DELETE the social after testing
  afterAll(async () => {
    await supertest(api).delete(endpoint).expect(OK);
  });

  it('updates project', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send(updatedSocial);

    expect(res.status).toBe(OK);
    expect(res.body).toEqual(updatedSocial);

  });

});

/**
 * PUT error tests for socials
 * - schema
 * - type is immutable
 */
describe('PUT /v1/socials/:id errors', () => {

  const invalidType = 'just not a type at all';
  const endpoint = `${base}/${invalidType}`;

  it('tests for nonexistent type', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({url: 'https://www.google.com'});

    const expectedError = {
      // TODO: figure out what kind of error response this should get
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for trying to update type', async () => {

    // Trying to update the type should send back an error
    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({type: 'github'});

    const expectedError = {
      // TODO: figure out what kind of error res to send (immutable param?)
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for empty handle', async () => {});

  it('tests for empty url', async () => {});

  it('tests for invalid url', async () => {});

});
