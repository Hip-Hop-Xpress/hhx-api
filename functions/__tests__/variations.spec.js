// Test file for variations endpoints

const supertest = require('supertest');
const app = require('../server');

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

    expect(response.status).toBe(200);
    expect(response.text).toEqual('Hello World!');

  });

});

/**
 * Collection-wide endpoints
 */
// FIXME: not working :(
describe('Collection-wide variation endpoint tests', () => {

  it('retrieves all variations for GET /v1/variations', async () => {

    const response = await supertest(app).get('/v1/variations');

    // GET /v1/variations should return an array of variation objects
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true)

  });

});

// Required to close connection to server once tests are done
afterAll(done => {
  app.close();
  done();
});
