// Starter code for Updates

const supertest = require('supertest'); 
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { OK, INVALID_PARAMS } = require('../errors/codes');
const { INVALID_REQUEST_ERR } = require('../errors/types');
const base = '/v1/updates';

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

  });

  it('GET /v1/updates/:id', async () => {

  });

  it('GET /v1/updates/:id/body', async () => {

  });

});

/**
 * GET endpoint tests with errors
 * - These endpoints should send identical errors
 */
describe('GET endpoint errors', () => {

  it('GET update tests for nonexistent id', async () => {

  });

  it('GET update body tests for nonexistent id', async () => {

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

  });

  it('POST /v1/updates/body', async () => {

  });

});

/**
 * POST endpoint errors
 * - schema errors
 * - nonexistent ID errors
 * - already existing ID errors
 */
describe('POST/DELETE endpoint error tests', () => {

  it('POST /updates tests for already existing id', async () => {

  });

  it('POST /updates tests for nonexistent id', async () => {

  });

  it('POST /updates tests for wrong type', async () => {

  });

  it('POST /updates tests for wrong id schema', async () => {

  });

  it('POST /updates tests for wrong name/author schema', async () => {

  });

  it('POST /updates tests for wrong body schema', async () => {

  });

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

  const initialUpdate = {};

  const updatedUpdate = {};

  const endpointUrl = `${base}/${initialUpdate.id}`;

  // POST the variation before testing PUT operations
  beforeAll(async () => {

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(initialProject)
      .expect(OK);

  });

  // DELETE the variation after testing
  afterAll(async () => {
    await supertest(api).delete(endpoint).expect(OK);
  });

  it('updates update successfully', async() => {

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

  });

  it('tests for wrong schema', async() => {

  });

});




