// Test file for variations endpoints

const supertest = require('supertest');
const app = require('../server');
const bodyParser = require('body-parser');

// Constants
const httpCodes = require('../errors/codes');
const errorTypes = require('../errors/types');
const base = '/v1/variations';
const numVariations = 2;

/**
 * Test endpoints
 */
describe('Run test endpoints', () => {
  test('sends correct message for GET /alive', async () => {
    const response = await supertest(app).get('/alive');

    expect(response.status).toBe(httpCodes.OK);
    expect(response.text).toEqual('The Hip Hop Xpress API is alive!');

  });

  test('sends correct message for GET /hello-world', async () => {
    const response = await supertest(app).get('/hello-world');

    expect(response.status).toBe(httpCodes.OK);
    expect(response.text).toEqual('Hello World!');

  });

});

/**
 * GET endpoints
 */
describe('GET endpoint tests', () => {

  test('GET /v1/variations - retrieves all variations', async () => {

    const response = await supertest(app).get(base);

    // GET /v1/variations should return an array of variation objects
    // with 2 variations
    expect(response.status).toBe(httpCodes.OK);
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toHaveLength(numVariations);

  });

  test('GET /v1/variations/:id - retrieves variation by ID', async () => {

    // Assuming that there is at least one variation
    const response = await supertest(app).get(base + '/0');

    // Verify that the success response returns an object
    expect(response.status).toBe(httpCodes.OK);
    expect(typeof response.body).toEqual('object');

    const variation = response.body;

    // Verify the contents of the variation object
    expect(variation.id).toEqual(0);
    expect(variation.date).not.toBeUndefined();

    // Check that the description and images arrays both have entries
    expect(Array.isArray(variation.description)).toBe(true);
    expect(variation.description.length).toBeGreaterThan(0);

    expect(Array.isArray(variation.images)).toBe(true);
    expect(variation.images.length).toBeGreaterThan(0);

  });

  test('GET /v1/variations/:id/images - retrieves images by ID', async () => {

    // Assuming there is at least one variation
    const response = await supertest(app).get(base + '/0/images');

    // Verify that the success response returns an array
    expect(response.status).toBe(httpCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);

    // Images should have at least on image object
    const images = response.body;
    expect(images.length).toBeGreaterThan(0);

    // Check the contents of image
    const image = images[0];
    expect(image.url).not.toBeUndefined();
    expect(image.caption).not.toBeUndefined();
    expect(image.componentImage).not.toBeUndefined();

  });

  test('GET /v1/variations/:id/description - retrieves desc by ID', async () => {

    // Assuming there is at least one variation
    const response = await supertest(app).get(base + '/0/description');

    // Verify success response returns array
    expect(response.status).toBe(httpCodes.OK);
    expect(Array.isArray(response.body)).toBe(true);

    const description = response.body;
    expect(description.length).toBeGreaterThan(0);

  });

});

/**
 * GET endpoint tests with errors
 * These endpoints should send identical errors
 */
describe('GET endpoint error tests', () => {

  // Setup expected error
  let id = 999;

  const expectedError = {
    type: 'id_not_found_error',
    code: '422',
    message: `The requested variation with id ${id} does not exist!`,
    param: 'id'
  };

  test('GET /v1/variations/:id - nonexistent id', async () => {
    // Using nonexistent id
    const response = await supertest(app).get(base + `/${id}`);

    expect(response.status).toBe(httpCodes.INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  test('GET /v1/variations/:id/images - nonexistent id', async() => {
    const response = await supertest(app).get(base + `/${id}/images`);

    expect(response.status).toBe(httpCodes.INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  test('GET /v1/variations/:id/description - nonexistent id', async() => {
    const response = await supertest(app).get(base + `/${id}/description`);

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
  const testVariation = {
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

  test('POST /v1/variations - creates new variation', async () => {

    // Send the POST request with the test variation and verify contents
    const response = await supertest(app)
      .post(base)
      .set('Accept', /json/)
      .send(testVariation);
      
    expect(response.status).toBe(httpCodes.OK);
    expect(response.body).toEqual(testVariation);

  });

  test('POST /v1/variations/:id/images - add image', async () => {

    // Setup mock image
    const testImage = {
      url: 'https://www.google.com',
      caption: 'another test image',
      componentImage: false
    };

    const response = await supertest(app)
      .post(`${base}/${testVariation.id}/images`)
      .set('Accept', /json/)
      .send(testImage);

    // Response should contain updated images array
    expect(response.status).toBe(httpCodes.OK);
    expect(Array.isArray(response.body)).toEqual(true);
    expect(response.body).toHaveLength(2);
    expect(response.body).toContainEqual(testImage);
  });

  // Delete the test variation after testing
  afterAll(async () => {
    await supertest(app).delete(`${base}/${testVariation.id}`);
  })

});

// Required to close connection to server once tests are done
afterAll(done => {
  app.close();
  done();
});
