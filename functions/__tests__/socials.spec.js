// Test file for Social media endpoints

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { OK, INVALID_PARAMS } = require('../errors/codes');
const { INVALID_REQUEST_ERR, DOC_NOT_FOUND_ERR, DOC_ALRDY_EXISTS_ERR, IMMUTABLE_ATTR_ERR } = require('../errors/types');
const base = '/v1/socials';

// FIXME: this could change at any point, which will affect tests
const currentSocials = [
  'instagram',
  'facebook',
  'soundcloud',
  'twitter'
];

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
describe('GET endpoints', () => {

  it('GET /v1/socials', async () => {

    const res = await supertest(api).get(base);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(currentSocials.length);

  });

  it('GET /v1/socials/types', async () => {

    const res = await supertest(api).get(`${base}/types`);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);

    const types = res.body;

    // Every known social media type should be here
    for (const type of currentSocials) {
      expect(types.includes(type)).toBe(true);
    }

  });
  
  // Starting asynchronous tasks immediately and resolving afterwards
  // https://eslint.org/docs/rules/no-await-in-loop
  it('GET /v1/socials/:type', async () => {

    const promises = [];

    // For every known social, send a GET request asking for
    // the social media object based on its type
    for (const type of currentSocials) {

      const url = `${base}/${type}`;
      const res = supertest(api).get(url).expect(OK);
      promises.push(res);

    }

    const results = await Promise.all(promises);
    let i = 0;

    // Verify that each response is a valid social media object
    for (const res of results) {

      expect(res.status).toBe(OK);
      expect(typeof res.body).toEqual('object');

      const socialMedia = res.body;
      expect(socialMedia.type).toEqual(currentSocials[i]);
      expect(socialMedia.handle.length).toBeGreaterThan(0);
      expect(typeof socialMedia.url).toEqual('string');

      i++;

    }

  });

});

/**
 * GET endpoints error tests
 */
describe('GET endpoints errors', () => {

  it('tests for nonexistent type', async () => {

    const nonexistentType = 'wordpress';
    const res = await supertest(api).get(`${base}/${nonexistentType}`);

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'The requested social media platform with type: "wordpress" does not exist!',
      param: 'type',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for invalid type', async () => {

    // not a valid type from the react-native-elements social icon types
    const invalidType = 'not a valid type';
    const res = await supertest(api).get(`${base}/${invalidType}`);

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"not a valid type" is not one of the social media types for react-native-elements social icon: https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type',
      param: 'type',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * POST endpoint tests
 *
 * This test suite:
 * - creates a mock social in the database
 * - deletes mock social afterwards
 * 
 */
describe('POST/GET/DELETE endpoint test', () => {

  beforeAll(async () => {
    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testSocial)
      .expect(OK);
  });

  it('POST successfully created new social and DELETE deletes/returns it', async() => {

    // Perform GET request on mock
    const getRes = await supertest(api)
      .get(`${base}/${testSocial.type}`)
      .expect(OK);
    
    expect(getRes.status).toBe(OK);
    expect(getRes.body).toEqual(testSocial);

    const deleteRes = await supertest(api)
      .delete(`${base}/${testSocial.type}`)
      .expect(OK);

    // Verify that res contains deleted mock social
    expect(deleteRes.status).toBe(OK);
    expect(deleteRes.body).toEqual(testSocial);

  });

});

/**
 * POST/DELETE /socials endpoint errors
 * - schema errors
 * - nonexistent type errors (DELETE)
 * - already existing type errors (POST)
 * - type is not valid (see: https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type)
 */
describe('POST/DELETE socials endpoint errors', () => {

  it('POST tests for type that already exists', async() => {

    const existingType = 'instagram';
    const existingSocial = {
      type: existingType,
      handle: '@uiuchhx',
      url: 'https://www.instagram.com/uiuchhx/'
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(existingSocial);

    const expectedError = {
      type: DOC_ALRDY_EXISTS_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'The requested social media platform with type: "instagram" already exists!',
      param: 'type',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST tests for invalid type', async() => {

    // not a valid type from the react-native-elements social icon types
    const invalidType = 'not a valid type';

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send({
        ...testSocial,
        type: invalidType
      });

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"type" is not one of the social media types for react-native-elements social icon: https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type',
      param: 'type',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST tests for empty handle', async() => {

    const emptyHandle = '';

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send({
        ...testSocial,
        handle: emptyHandle
      });

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"handle" is not allowed to be empty',
      param: 'handle',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST tests for no url', async() => {

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send({
        ...testSocial,
        url: undefined
      });

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"url" is required',
      param: 'url',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST tests for invalid url', async() => {

    const invalidUrl = 'not a valid url';

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send({
        ...testSocial,
        url: invalidUrl
      });

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"url" must be a valid uri',
      param: 'url',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('DELETE tests for nonexistent type', async() => {

    const nonexistentType = 'wordpress';

    const res = await supertest(api).delete(`${base}/${nonexistentType}`);

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'The requested social media platform with type: "wordpress" does not exist!',
      param: 'type',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

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
      .send(initialSocial)
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

  const invalidType = 'wp';
  const endpoint = `${base}/${invalidType}`;

  it('tests for nonexistent type', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({url: 'https://www.google.com'});

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'The requested social media platform with type: "wp" does not exist!',
      param: 'type',
      original: null
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
      type: IMMUTABLE_ATTR_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'The attribute "type" is immutable and cannot be updated!',
      param: 'type',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for empty handle', async () => {

    const emptyHandle = '';

    const res = await supertest(api)
      .put(`${base}/${invalidType}`)
      .set('Accept', /json/)
      .send({
        handle: emptyHandle
      });

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"handle" is not allowed to be empty',
      param: 'handle',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for invalid url', async () => {

    const invalidUrl = 'not a valid url';

    const res = await supertest(api)
      .put(`${base}/${invalidType}`)
      .set('Accept', /json/)
      .send({
        url: invalidUrl
      });

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"url" must be a valid uri',
      param: 'url',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});
