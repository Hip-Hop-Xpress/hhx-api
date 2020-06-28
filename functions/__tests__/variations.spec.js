// Test file for variations endpoints

const supertest = require('supertest');
const app = require('../server');

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
 */
describe('GET endpoint error tests', () => {

  test('GET /v1/variations/:id - nonexistent id', async () => {

    // Using nonexistent id
    const response = await supertest(app).get(base + '/999');

    const expected = {
      type: 'id_not_found_error',
      code: '422',
      message: 'The requested variation with id 999 does not exist!',
      param: 'id'
    };

    expect(response.status).toBe(httpCodes.INVALID_PARAMS);
    expect(response.body).toEqual(expected);
  });

});

// Required to close connection to server once tests are done
afterAll(done => {
  app.close();
  done();
});
