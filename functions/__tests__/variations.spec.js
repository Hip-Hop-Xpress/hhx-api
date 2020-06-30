// Test file for variations endpoints
// Refactored using this answer: https://stackoverflow.com/a/56987548

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const httpCodes = require('../errors/codes');
const errorTypes = require('../errors/types');
const base = '/v1/variations';
const numVariations = 2;

let adminInitStub;
const functionsTest = test();

beforeAll(async () => {
  adminInitStub = sinon.stub(admin, 'initializeApp');
});

afterAll(async () => {
  adminInitStub.restore();
  functionsTest.cleanup();
});

/**
 * Test endpoints
 */
describe('Run test endpoints', () => {
  it('/alive', async () => {
    const res = await supertest(api).get('/alive');
    expect(res.status).toBe(httpCodes.OK);
    expect(res.text).toEqual('The Hip Hop Xpress API is alive!');
  });

  it('/hello-world', async () => {
    const res = await supertest(api).get('/hello-world');
    expect(res.status).toBe(httpCodes.OK);
    expect(res.text).toEqual('Hello World!');
  });
});


/**
 * Variations Endpoints Unit Tests
 * 
 * NOTE: all tests look at the production Firestore database
 * TODO: find a way to run unit tests using Firestore emulator instead of actual database
 *       I've tried doing this but it's hard and may take a while. Will try with another collection
 */

// GET Endpoints
describe('GET endpoints', () => {

  it('GET /v1/variations', async () => {

    const res = await supertest(api).get(base);

    expect(res.status).toBe(httpCodes.OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(numVariations);

  });

  it('GET /v1/variations/:id', async () => {

    // Assuming that there is at least one variation
    const res = await supertest(api).get(base + '/0');

    // Verify that the success response returns an object
    expect(res.status).toBe(httpCodes.OK);
    expect(typeof res.body).toEqual('object');

    const variation = res.body;

    // Verify the contents of the variation object
    expect(variation.id).toEqual(0);
    expect(variation.date).not.toBeUndefined();

    // Check that the description and images arrays both have entries
    expect(Array.isArray(variation.description)).toBe(true);
    expect(variation.description.length).toBeGreaterThan(0);

    expect(Array.isArray(variation.images)).toBe(true);
    expect(variation.images.length).toBeGreaterThan(0);

  });

  it('GET /v1/variations/:id/images', async () => {

    // Assuming there is at least one variation
    const res = await supertest(api).get(base + '/0/images');

    // Verify that the success response returns an array
    expect(res.status).toBe(httpCodes.OK);
    expect(Array.isArray(res.body)).toBe(true);

    // Images should have at least on image object
    const images = res.body;
    expect(images.length).toBeGreaterThan(0);

    // Check the contents of image
    const image = images[0];
    expect(image.url).not.toBeUndefined();
    expect(image.caption).not.toBeUndefined();
    expect(image.componentImage).not.toBeUndefined();

  });

  it('GET /v1/variations/:id/description', async () => {

    // Assuming there is at least one variation
    const res = await supertest(api).get(base + '/0/description');

    // Verify success response returns array
    expect(res.status).toBe(httpCodes.OK);
    expect(Array.isArray(res.body)).toBe(true);

    const description = res.body;
    expect(description.length).toBeGreaterThan(0);

  });

});

/**
 * GET endpoint tests with errors
 * These endpoints should send identical errors
 */
describe('GET endpoint errors', () => {

  // Setup expected error
  let id = 999;

  const expectedError = {
    type: 'id_not_found_error',
    code: '422',
    message: `The requested variation with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  it('GET /v1/variations/:id - nonexistent id', async () => {
    // Using nonexistent id
    const response = await supertest(api).get(base + `/${id}`);

    expect(response.status).toBe(httpCodes.INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  it('GET /v1/variations/:id/images - nonexistent id', async() => {
    const response = await supertest(api).get(base + `/${id}/images`);

    expect(response.status).toBe(httpCodes.INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  it('GET /v1/variations/:id/description - nonexistent id', async() => {
    const response = await supertest(api).get(base + `/${id}/description`);

    expect(response.status).toBe(httpCodes.INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

});

/**
 * POST endpoint tests
 * 
 * Had issues including data in the request body for POST requests
 * Solved with this: https://github.com/visionmedia/supertest/issues/168#issuecomment-66533114
 * tl;dr: having express use body parser (see app.js)
 * 
 * This test suite:
 * - creates a test/mock variation (still put in production database)
 * - performs POST requests on description and images
 * - deletes the test variation after all tests run
 * 
 */
describe('POST endpoint tests', () => {

  // Mock variation/image/description to add for POST requests
  const var1 = {
    id: 999,
    name: 'test variation',
    date: '2020',
    images: [
      {
        url: 'https://www.google.com',
        caption: 'this isn\'t a real image',
        componentImage: false,
      }
    ],
    description: [
      'a single entry in the description'
    ]
  };

  // Construct another test variation with different ID
  const var2 = {
    ...var1,
    id: 1000
  };

  const testImage = {
    url: 'https://www.google.com',
    caption: 'another test image',
    componentImage: false
  };

  // Create test variations before running unit tests
  beforeAll(async () => {
    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(var1)
      .expect(httpCodes.OK);

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(var2)
      .expect(httpCodes.OK);
  });

  // Delete the test variation after tests
  afterAll(async () => {
    await supertest(api).delete(`${base}/${var1.id}`);
    await supertest(api).delete(`${base}/${var2.id}`);
  });

  it('POST /v1/variations - creates new variation', async () => {

    // Test variation has already been created in beforeEach block
    // Just check that it exists and is equal
    const response = await supertest(api).get(`${base}/${var1.id}`);
    expect(response.status).toBe(httpCodes.OK);
    expect(response.body).toEqual(var1);

  });

  it('POST /v1/variations/:id/images', async () => {
    
    let expectedNewLength = 2;

    const firstRes = await supertest(api)
      .post(`${base}/${var1.id}/images`)
      .set('Accept', /json/)
      .send(testImage);

    expect(firstRes.status).toBe(httpCodes.OK);
    expect(Array.isArray(firstRes.body)).toBe(true);
    expect(firstRes.body).toHaveLength(expectedNewLength);

    let images = [
      testImage,
      testImage,
      testImage
    ];

    // Make the new test images unique
    let i = 1;
    let newImages = images.map(img => (
      {
        url: img.url,
        componentImage: false,
        caption: (i++).toString()
      }
    ));

    expectedNewLength = 4;

    const secondRes = await supertest(api)
      .post(`${base}/${var2.id}/images`)
      .set('Accept', /json/)
      .send(newImages);
    
      expect(secondRes.status).toBe(httpCodes.OK);
      expect(Array.isArray(secondRes.body)).toBe(true);
      expect(secondRes.body).toHaveLength(expectedNewLength);

  });

  it('POST /v1/variations/:id/description', async() => {

    const endpoint = `${base}/${var1.id}/description`;
    const newEntries = [
      'multiple entries...',
      '... added to description...',
      '... in an array!'
    ];

    // 1 original entry + 3 new entries
    const expectedNewLength = 4;
    
    const res = await supertest(api)
      .post(endpoint)
      .set('Accept', /json/)
      .send(newEntries);

    // Response should contain updated description
    expect(res.status).toBe(httpCodes.OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

});
