// Starter code for Updates

const supertest = require('supertest'); 
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { OK, INVALID_PARAMS } = require('../errors/codes');
const { INVALID_REQUEST_ERR, ID_NOT_FOUND_ERR, ID_ALREADY_EXISTS } = require('../errors/types');
const base = '/v1/updates';

// TODO:  THIS IS SUBJECT TO CHANGE
const numUpdates = 4;

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
 * Updates Endpoints Unit Tests
 * 
 * NOTE: all tests use the production Firestore database
 */

// Mock update for testing POST requests
const testUpdate = {
  id: 999,
  title: 'a test update',
  author: 'some random author',
  body: [
    'paragraph 1',
    'paragraph 2',
    'paragraph 3',
  ]
};

/**
 * Test GET endpoints (uses prod database)
 */
describe('GET endpoints', () => {

  it('GET /v1/updates', async () => {

    const res = await supertest(api).get(base);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(numUpdates);

  });

  it('GET /v1/updates/:id', async () => {

    // Check first update
    const res = await supertest(api).get(base + '/0');

    // Verify that the success respones returns an object
    expect(res.status).toBe(OK);
    expect(typeof res.body).toEqual('object');

    const update = res.body;

    // Verify contents of update object
    expect(update.id).toEqual(0);
    expect(typeof update.title).toEqual('string');
    expect(typeof update.dateCreated).toEqual('string');
    expect(typeof update.author).toEqual('string');

    expect(Array.isArray(update.body)).toBe(true);
    expect(update.body.length).toBeGreaterThan(0);

  });

  it('GET /v1/updates/:id/body', async () => {

    const res = await supertest(api).get(base + '/0/body');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);

    const body = res.body;
    expect(body.length).toBeGreaterThan(0);

  });

});

/**
 * GET endpoint tests with errors
 * - These endpoints should send identical errors
 */
describe('GET endpoint errors', () => {

  // Setup expected errors
  let id = 404;
  const expectedError = {
    type: ID_NOT_FOUND_ERR,
    code: INVALID_PARAMS.toString(),
    message: `The requested update with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  it('GET update tests for nonexistent id', async () => {
    // Using nonexistent id
    const response = await supertest(api).get(`${base}/${id}`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  it('GET update body tests for nonexistent id', async () => {
    // Using nonexistent id
    const response = await supertest(api).get(`${base}/${id}/body`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

});

/**
 * POST endpoint tests
 *
 * This test suite:
 * - creates a mock update in the database
 * - performs POST requests on the update body
 * - deletes mock update afterwards
 */
describe('POST endpoint tests (tests /DELETE too)', () => {

  // Create test update before running unit tests
  beforeAll(async () => {
    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testUpdate)
      .expect(OK);
  });

  // Delete the test update after tests
  afterAll(async () => {
    await supertest(api).delete(`${base}/${testUpdate.id}`);
  });

  it('POST /v1/updates', async () => {

    // Test update has already been created in beforeAll block
    // Just check that its main contents are equal (not the timestamps)
    const res = await supertest(api).get(`${base}/${testUpdate.id}`);

    expect(res.status).toBe(OK);

    const update = res.body;

    // Verify contents of update object
    expect(update.id).toEqual(testUpdate.id);
    expect(update.title).toEqual(testUpdate.title);
    expect(update.author).toEqual(testUpdate.author);
    expect(typeof update.dateCreated).toEqual('string');
    expect(update.lastUpdated).toBe(null);
    expect(Array.isArray(update.body)).toBe(true);
    expect(update.body.length).toBeGreaterThan(0);

  });

  it('POST /v1/updates/body', async () => {

    const endpoint = `${base}/${testUpdate.id}/body`;
    const newEntries = [
      'multiple entries...',
      '... added to body...',
      '... in an array!'
    ];

    const expectedNewLength = testUpdate.body.length + newEntries.length;
    
    const res = await supertest(api)
      .post(endpoint)
      .set('Accept', /json/)
      .send(newEntries);

    // Response should contain updated description
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

});

/**
 * POST /updates endpoint errors
 * - schema errors
 * - nonexistent ID errors
 * - already existing ID errors
 */
describe('POST/DELETE /updates endpoint error tests', () => {

  it('POST /updates tests for already existing id', async () => {

    const existingId = 0;  // assuming there's at least one existing update
    const invalidUpdateReq = {
      ...testUpdate,
      id: existingId
    };

    // Valid update, invalid request because id already exists
    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidUpdateReq);
    
    const expectedError = {
      type: ID_ALREADY_EXISTS,
      code: INVALID_PARAMS.toString(),
      message: `The requested update with id ${existingId} already exists!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /updates tests for wrong type', async () => {

    // Send nothing, will get caught by type checking
    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send();

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"id" is required',
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /updates tests for wrong id schema', async () => {

    const negativeId = -404;
    const invalidUpdateReq = {
      ...testUpdate,
      id: negativeId
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidUpdateReq);

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"id" must be larger than or equal to 0',
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /updates tests for empty author', async () => {

    const emptyAuthor = '';
    const invalidUpdateReq = {
      ...testUpdate,
      author: emptyAuthor
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidUpdateReq);

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"author" is not allowed to be empty',
      param: 'author',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);
    
  });

  it('POST /updates tests for empty title', async () => {

    const emptyTitle = '';
    const invalidUpdateReq = {
      ...testUpdate,
      title: emptyTitle
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidUpdateReq);

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"title" is not allowed to be empty',
      param: 'title',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);
    
  });

  it('POST /updates tests for empty body', async () => {

    const emptyBody = [];
    const invalidUpdateReq = {
      ...testUpdate,
      body: emptyBody
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidUpdateReq);

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"body" does not contain 1 required value(s)',
      param: 'body',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('DELETE /updates tests for nonexistent id', async () => {

    const nonexistentId = 404;

    const res = await supertest(api)
      .delete(`${base}/${nonexistentId}`);

    const expectedError = {
      type: ID_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: `The requested update with id ${nonexistentId} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * POST /updates/:id/body endpoint errors
 * - schema errors
 * - nonexistent ID errors
 */
describe('POST /updates/:id/body error tests', () => {

  it('POST /body tests for nonexistent id', async () => {

  });

  it('POST /body tests for wrong type', async () => {

  });

  it('POST /body tests for wrong schema', async () => {

  });

});

/**
 * PUT endpoint test
 * - tests individual fields to ensure that everything updates correctly
 */
describe('PUT /v1/updates/:id updates the update', () => {

  const putId = 806;

  const initialUpdate = {
    ...testUpdate,
    id: putId
  };

  const updatedUpdate = {
    id: putId,
    title: 'the updated title',
    author: 'the updated author',
    body: [
      'new paragraph 1',
      'new paragraph 2'
    ]
  };

  const endpointUrl = `${base}/${initialUpdate.id}`;

  // POST the variation before testing PUT operations
  beforeAll(async () => {

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(initialUpdate)
      .expect(OK);

  });

  // DELETE the variation after testing
  afterAll(async () => {
    await supertest(api).delete(endpointUrl).expect(OK);
  });
  
  /**
   * Check that the PUT requests changes the 'lastUpdated' field
   * 1. perform GET request to make sure that lastUpdated is null
   * 2. perform PUT request
   * 3. Make sure that lastUpdated is now a string
   */
  it('update document updates successfully', async() => {
    
    const initialGetRes = await supertest(api).get(endpointUrl);
    expect(initialGetRes.status).toBe(OK);
    expect(initialGetRes.body.lastUpdated).toBe(null);

    const dateCreated = initialGetRes.body.dateCreated;

    const putRes = await supertest(api)
      .put(endpointUrl)
      .set('Accept', /json/)
      .send(updatedUpdate);

    expect(putRes.status).toBe(OK);
    const update = putRes.body;

    // Check attributes individually
    expect(update.id).toBe(updatedUpdate.id);
    expect(update.title).toEqual(updatedUpdate.title);
    expect(update.author).toEqual(updatedUpdate.author);
    expect(update.body).toEqual(updatedUpdate.body);
    expect(update.dateCreated).toEqual(dateCreated);
    expect(update.lastUpdated).not.toBe(null);
    expect(typeof update.lastUpdated).toEqual('string');

  });

});

/**
 * PUT endpoint errors
 * - schema errors
 * - nonexistent ID errors
 */
describe('PUT /v1/updates/:id errors', () => {

  const invalidId = 999999;
  const endpoint = `${base}/${invalidId}`;

  it('tests for nonexistent id', async() => {

    const res = await supertest(api)
    .put(endpoint)
    .set('Accept', /json/)
    .send({title: 'valid title'});

    const expectedError = {
      type: ID_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: `The requested update with id ${invalidId} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for empty title', async() => {

    const emptyTitle = '';

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({title: emptyTitle});

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"title" is not allowed to be empty',
      param: 'title',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for empty author', async() => {

    const emptyAuthor = '';

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({author: emptyAuthor});

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"author" is not allowed to be empty',
      param: 'author',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for empty body', async() => {

    const emptyBody = [];

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({body: emptyBody});

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"body" does not contain 1 required value(s)',
      param: 'body',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});




