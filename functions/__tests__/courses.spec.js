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
  images: [
    {
      url: 'https://www.google.com',
      caption: 'caption 1'
    },
    {
      url: 'https://www.google.com',
      caption: 'caption 2'
    }
  ],
  startDate: 'Summer 2020',
  endDate: null,
};

// Test course image schema with correct schema
const testImage = {
  url: 'https://www.google.com',
  caption: 'caption 2'
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

    const course = res.body;

    // Verify the contents of the course object
    expect(course.id).toEqual(0);
    expect(course.startDate).not.toBeUndefined();
    expect(course.endDate).not.toBeUndefined();

    // Check that the description and image arrays both have entries
    expect(Array.isArray(course.description)).toBe(true);
    expect(course.description.length).toBeGreaterThan(0);

    expect(Array.isArray(course.images)).toBe(true);
    expect(course.images.length).toBeGreaterThan(0);

  });

  it('GET /v1/courses/:id/description', async () => {

    const res = await supertest(api).get(base + '/0/description');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);

    const description = res.body;
    expect(description.length).toBeGreaterThan(0);

  });

  it('GET /v1/courses/:id/images', async () => {

    const res = await supertest(api).get(base + '/0/images');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);

    const images = res.body;
    expect(images.length).toBeGreaterThan(0);

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
 * - performs POST requests on description and images
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

  it('POST /v1/courses/:id/images', async() => {

    const endpoint = `${base}/${testCourse.id}/images`;
    const newImages = [
      testImage,
      testImage,
      testImage,
      testImage
    ];

    const expectedNewLength = testCourse.images.length + newImages.length;
    
    const res = await supertest(api)
      .post(endpoint)
      .set('Accept', /json/)
      .send(newImages);

    // Response should contain updated members
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

});

/**
 * POST /courses endpoint errors
 * - TODO: schema errors
 * - nonexistent ID errors
 * - already existing ID errors
 */
describe('POST/DELETE course endpoint errors', () => {

  it('POST /courses tests for already existing id', async () => {

    const existingId = 0;  // assuming there's at least one existing course
    const invalidCourseReq = {
      ...testCourse,
      id: existingId
    };

    // Valid course, invalid request because id already exists
    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidCourseReq);
    
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

  it('POST tests for empty name', async() => {

    const emptyName = '';

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send({
        ...testCourse,
        name: emptyName
      });

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

  it('POST tests for empty description', async() => {

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send({
        ...testCourse,
        description: []
      });

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"description" must contain at least 1 items',
      param: 'description',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST tests for empty images', async() => {

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send({
        ...testCourse,
        images: []
      });

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"images" must contain at least 1 items',
      param: 'images',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST tests for short start date', async () => {

    // Using unique ID for each test
    const shortDate = {
      ...testCourse,
      startDate: '200'
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(shortDate);
    
    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"startDate" length must be at least 4 characters long',
      param: 'startDate',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST tests for short end date', async () => {

    // Using unique ID for each test
    const shortDate = {
      ...testCourse,
      endDate: '200'
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(shortDate);
    
    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"endDate" length must be at least 4 characters long',
      param: 'endDate',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('DELETE tests for nonexistent id', async() => {

    const nonexistentId = 404;

    const res = await supertest(api).delete(`${base}/${nonexistentId}`);

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: `The requested course with id ${nonexistentId} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * POST errors for description and images
 * TODO: figure out how to send strings in request body
 */
describe('POST description and images errors', () => {

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
      code: INVALID_PARAMS.toString(),
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
      message: 'Request body must be string or array of strings',
      param: null,
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('images - nonexistent id', async () => {
    // this id won't exist
    const id = 600;
    const images = [
      testImage,
      testImage
    ];

    // Valid description, nonexistent id
    const res = await supertest(api)
      .post(`${base}/${id}/images`)
      .set('Accept', /json/)
      .send(images);

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: `The requested course with id ${id} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('images - incorrect type', async () => {
    
    const id = 601;

    // Send nothing, will get caught by type checking
    const res = await supertest(api)
      .post(`${base}/${id}/members`)
      .set('Accept', /json/)
      .send();

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'Request body must be string or array of strings',
      param: null,
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('images - invalid url', async () => {
    // this id won't exist
    const id = 0;

    // The second image has an invalid url
    const images = [
      testImage,
      {
        ...testImage,
        url: 'not a url'
      }
    ];

    // Valid description, nonexistent id
    const res = await supertest(api)
      .post(`${base}/${id}/images`)
      .set('Accept', /json/)
      .send(images);

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"url" must be a valid uri',
      param: 'url',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('images - undefined caption', async () => {
    // this id won't exist
    const id = 600;
    const images = [
      testImage,
      {
        ...testImage,
        caption: undefined
      }
    ];

    // Valid description, nonexistent id
    const res = await supertest(api)
      .post(`${base}/${id}/images`)
      .set('Accept', /json/)
      .send(images);

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: `"caption" is required`,
      param: 'caption',
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
