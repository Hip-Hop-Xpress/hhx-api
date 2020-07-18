// Test file for Courses endpoints

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { OK, INVALID_PARAMS } = require('../errors/codes');
const { INVALID_REQUEST_ERR, DOC_NOT_FOUND_ERR, DOC_ALRDY_EXISTS_ERR } = require('../errors/types');
const base = '/v1/courses';
const numCourses = 9;

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
 * Courses Endpoints Unit Tests
 * 
 * NOTE: all tests use the production Firestore database
 * TODO: figure out how to verify that icon is a Material Icons id
 */

// Test course object with correct schema
const testCourse = {
  id: 999,
  name: 'test course',
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
 * NOTE: assumes that all current HHX courses are in the database
 *       (see variable 'numCourses')
 */
describe('GET endpoints', () => {

  it('GET /v1/courses', async () => {

    const res = await supertest(api).get(base);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(numCourses);

  });

  it('GET /v1/courses/:id', async () => {

    // Check first course
    const res = await supertest(api).get(base + '/0');

    // Verify that the success response returns an object
    expect(res.status).toBe(OK);
    expect(typeof res.body).toEqual('object');

    const proj = res.body;

    // Verify the contents of the course object
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

  it('GET /v1/courses/:id/description', async () => {

    const res = await supertest(api).get(base + '/0/description');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);

    const description = res.body;
    expect(description.length).toBeGreaterThan(0);

  });

  it('GET /v1/courses/:id/members', async () => {

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
    type: DOC_NOT_FOUND_ERR,
    code: '422',
    message: `The requested course with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  it('GET /v1/courses/:id - nonexistent id', async () => {
    // Using nonexistent id
    const response = await supertest(api).get(base + `/${id}`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  it('GET /v1/courses/:id/description - nonexistent id', async () => {
    const response = await supertest(api).get(base + `/${id}/description`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  it('GET /v1/courses/:id/members - nonexistent id', async () => {
    const response = await supertest(api).get(base + `/${id}/members`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

});

/**
 * POST endpoint tests
 *
 * This test suite:
 * - creates a mock course in the database
 * - performs POST requests on description and members
 * - deletes mock course afterwards
 * 
 */
describe('POST endpoint tests (tests /DELETE too)', () => {

  // Create test course before running unit tests
  beforeAll(async () => {
    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testCourse)
      .expect(OK);
  });

  // Delete the test course after tests
  afterAll(async () => {
    await supertest(api).delete(`${base}/${testCourse.id}`);
  });

  it('POST /v1/courses - creates new course', async () => {

    // Test course has already been created in beforeAll block
    // Just check that it exists and is equal
    const res = await supertest(api).get(`${base}/${testCourse.id}`);

    expect(res.status).toBe(OK);
    expect(res.body).toEqual(testCourse);

  });

  it('POST /v1/courses/:id/description', async() => {

    const endpoint = `${base}/${testCourse.id}/description`;
    const newEntries = [
      'multiple entries...',
      '... added to description...',
      '... in an array!'
    ];

    const expectedNewLength = testCourse.description.length + newEntries.length;
    
    const res = await supertest(api)
      .post(endpoint)
      .set('Accept', /json/)
      .send(newEntries);

    // Response should contain updated description
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

  it('POST /v1/courses/:id/members', async() => {

    const endpoint = `${base}/${testCourse.id}/members`;
    const newMembers = [
      'new member 1',
      'new member 2',
      'new member 3',
      'new member 4'
    ];

    const expectedNewLength = testCourse.members.length + newMembers.length;
    
    const res = await supertest(api)
      .post(endpoint)
      .set('Accept', /json/)
      .send(newMembers);

    // Response should contain updated members
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

});

/**
 * POST /courses endpoint errors
 * - TODO: schema errors
 * - TODO: nonexistent ID errors
 * - already existing ID errors
 */
describe('POST/DELETE course endpoint errors', () => {

  it('POST /courses tests for already existing id', async () => {

    const existingId = 0;  // assuming there's at least one existing course
    const invalidUpdateReq = {
      ...testCourse,
      id: existingId
    };

    // Valid course, invalid request because id already exists
    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidUpdateReq);
    
    const expectedError = {
      type: DOC_ALRDY_EXISTS_ERR,
      code: INVALID_PARAMS.toString(),
      message: `The requested course with id ${existingId} already exists!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * POST errors for description and members
 * TODO: figure out how to send strings in request body
 */
describe('POST description and members errors', () => {

  it('description - nonexistent id', async () => {
    // this id won't exist
    const id = 600;
    const description = [
      'test',
      'test'
    ];

    // Valid description, nonexistent id
    const res = await supertest(api)
      .post(`${base}/${id}/description`)
      .set('Accept', /json/)
      .send(description);

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: '422',
      message: `The requested course with id ${id} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('description - incorrect type', async () => {
    
    const id = 601;

    // Send nothing, will get caught by type checking
    const res = await supertest(api)
      .post(`${base}/${id}/description`)
      .set('Accept', /json/)
      .send();

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'Body must be string or array of strings',
      param: null,
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('members - nonexistent id', async () => {
    // this id won't exist
    const id = 600;
    const members = [
      'test member 1',
      'test member 2'
    ];

    // Valid description, nonexistent id
    const res = await supertest(api)
      .post(`${base}/${id}/members`)
      .set('Accept', /json/)
      .send(members);

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: '422',
      message: `The requested course with id ${id} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('members - incorrect type', async () => {
    
    const id = 601;

    // Send nothing, will get caught by type checking
    const res = await supertest(api)
      .post(`${base}/${id}/members`)
      .set('Accept', /json/)
      .send();

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'Body must be string or array of strings',
      param: null,
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * PUT tests for courses
 */
describe('PUT /v1/courses/:id updates course', () => {

  const id = 500;

  // Setting up an initial course which will have its values
  // updated to be the updated course
  const initialCourse = {
    ...testCourse,
    id: id
  };

  const updatedCourse = {
    id: id,
    name: 'the updated course',
    description: [
      'this is...',
      '... an updated description!'
    ],
    members: [
      'updated member 1',
      'updated member 2',
      'updated member 3',
      'updated member 4'
    ],
    startDate: 'January 2020',
    endDate: 'June 2020',
    icon: 'chair',
  };

  // PUT and DELETE operations all use this endpoint
  const endpoint = `${base}/${initialCourse.id}`;

  // POST the course before testing PUT operations
  beforeAll(async () => {

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(initialCourse)
      .expect(OK);

  });

  // DELETE the course after testing
  afterAll(async () => {
    await supertest(api).delete(endpoint).expect(OK);
  });

  it('updates course', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send(updatedCourse);

    expect(res.status).toBe(OK);
    expect(res.body).toEqual(updatedCourse);

  });

});

describe('PUT /v1/courses/:id errors', () => {

  const invalidId = 501;
  const endpoint = `${base}/${invalidId}`;

  it('tests for nonexistent id', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({name: 'valid test name'});

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: `The requested course with id ${invalidId} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for empty name', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({name: ''});

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"name" is not allowed to be empty',
      param: 'name',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});
