// Test file for Projects endpoints

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { OK, INVALID_PARAMS } = require('../errors/codes');
const errorTypes = require('../errors/types');
const base = '/v1/projects';
const numProjects = 8;

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
 * Projects Endpoints Unit Tests
 * 
 * NOTE: all tests use the production Firestore database
 * TODO: figure out how to verify that icon is a Material Icons id
 */

// Test project object with correct schema
const testProject = {
  id: 999,
  name: 'test project',
  description: [
    'paragraph 1',
    'paragraph 2',
    'paragraph 3'
  ],
  members: [
    'member 1',
    'member 2'
  ],
  startDate: '2020',
  endDate: null,
  icon: 'chair'
};

/**
 * GET endpoints tests
 * 
 * NOTE: assumes that all current HHX projects are in the database
 *       (see variable 'numProjects')
 */
describe('GET endpoints', () => {

  it('GET /v1/projects', async () => {

    const res = await supertest(api).get(base);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(numProjects);

  });

  it('GET /v1/projects/:id', async () => {

    // Check first project
    const res = await supertest(api).get(base + '/0');

    // Verify that the success response returns an object
    expect(res.status).toBe(OK);
    expect(typeof res.body).toEqual('object');

    const proj = res.body;

    // Verify the contents of the variation object
    expect(proj.id).toEqual(0);
    expect(proj.startDate).not.toBeUndefined();
    expect(proj.endDate).not.toBeUndefined();
    expect(proj.icon).not.toBeUndefined();

    // Check that the description and members both have entries
    expect(Array.isArray(proj.description)).toBe(true);
    expect(proj.description.length).toBeGreaterThan(0);

    expect(Array.isArray(proj.members)).toBe(true);
    expect(proj.members.length).toBeGreaterThan(0);

  });

  it('GET /v1/projects/:id/description', async () => {

    const res = await supertest(api).get(base + '/0/description');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);

    const description = res.body;
    expect(description.length).toBeGreaterThan(0);

  });

  it('GET /v1/projects/:id/members', async () => {

    const res = await supertest(api).get(base + '/0/members');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);

    const description = res.body;
    expect(description.length).toBeGreaterThan(0);

  });

});

describe('GET endpoints errors', () => {

  // Setup expected errors
  let id = 999;
  const expectedError = {
    type: 'id_not_found_error',
    code: '422',
    message: `The requested project with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  it('GET /v1/projects/:id - nonexistent id', async () => {
    // Using nonexistent id
    const response = await supertest(api).get(base + `/${id}`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  it('GET /v1/projects/:id/description - nonexistent id', async () => {
    const response = await supertest(api).get(base + `/${id}/description`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  it('GET /v1/projects/:id/members - nonexistent id', async () => {
    const response = await supertest(api).get(base + `/${id}/members`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

});
