// Test file for variations endpoints

const supertest = require('supertest');
const app = require('../server');

// Constants
const success = 200;
const base = '/v1/variations';
const numVariations = 2;

/**
 * Test endpoints
 */
describe('Run test endpoints', () => {
  it('sends correct message for GET /alive', async () => {
    const response = await supertest(app).get('/alive');

    expect(response.status).toBe(200);
    expect(response.text).toEqual('The Hip Hop Xpress API is alive!');

  });

  it('sends correct message for GET /hello-world', async () => {
    const response = await supertest(app).get('/hello-world');

    expect(response.status).toBe(success);
    expect(response.text).toEqual('Hello World!');

  });

});

/**
 * GET endpoints
 */
describe('GET endpoint tests for Variations collection', () => {

  it('retrieves all variations for GET /v1/variations', async () => {

    const response = await supertest(app).get(base);

    // GET /v1/variations should return an array of variation objects
    // with 2 variations
    expect(response.status).toBe(success);
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toHaveLength(numVariations);

  });

  it('retrieves specific variations by ID for GET /v1/variations/:id', async () => {

    // Assuming that there is at least one variation
    
    // First variation
    const response = await supertest(app).get(base + '/0');

    // Verify that the success response returns an object
    expect(response.status).toBe(success);
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

});

// Required to close connection to server once tests are done
afterAll(done => {
  app.close();
  done();
});
