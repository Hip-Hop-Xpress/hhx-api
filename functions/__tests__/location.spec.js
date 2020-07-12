// Test file for Location endpoints

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { OK, INVALID_PARAMS } = require('../errors/codes');
const { INVALID_REQUEST_ERR } = require('../errors/types');
const base = '/v1/location';

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
 * Tests the single GET endpoint for location
 */
describe('GET endpoint', () => {

  it('GET /v1/location', async () => {

    const res = await supertest(api).get(base);
    expect(res.status).toBe(OK);

    // Verify contents of location
    const location = res.body;
    
    // Check name
    expect(typeof location.name).toBe('string');
    expect(location.name.length).toBeGreaterThan(0);
    
    // Check latitude/longitude
    expect(typeof location.latitude).toBe('number');
    expect(typeof location.longitude).toBe('number');

  });

});

/**
 * Since there is only one location document, we have to use that
 * document to test
 * Test procedure will go as follows:
 *   1. update the location document and test accordingly
 *   2. after all the tests, revert the location back to original
 */
describe('PUT /v1/location', () => {

  const originalLocation = {
    name: 'University of Illinois at Urbana-Champaign Campustown',
    latitude: 40.102,
    longitude: -88.2272
  };

  const updatedLocation = {
    name: 'City of Chicago',
    latitude: 41.8781,
    longitude: 87.6298
  };

  // Replace location doc after tests with original location
  afterAll(async () => {

    await supertest(api)
      .put(base)
      .set('Accept', /json/)
      .send(originalLocation);

  });

  it('updates name correctly', async () => {

    const res = await supertest(api)
      .put(base)
      .set('Accept', /json/)
      .send({
        name: updatedLocation.name
      });

    expect(res.status).toBe(OK);
    expect(res.body.name).toEqual(updatedLocation.name);

  });

  it('updates latitude correctly', async () => {

    const res = await supertest(api)
      .put(base)
      .set('Accept', /json/)
      .send({
        latitude: updatedLocation.latitude
      });

    expect(res.status).toBe(OK);
    expect(res.body.latitude).toEqual(updatedLocation.latitude);

  });

  it('updates longitude correctly', async () => {

    const res = await supertest(api)
      .put(base)
      .set('Accept', /json/)
      .send({
        longitude: updatedLocation.longitude
      });

    expect(res.status).toBe(OK);
    expect(res.body.longitude).toEqual(updatedLocation.longitude);

  });

});

/**
 * PUT error tests
 * Test expected errors when sending PUT requests for the location
 */
describe('PUT endpoint errors', () => {

  it('tests for empty string', async () => {
    
    // Send an empty name in the req body
    const res = await supertest(api)
      .put(base)
      .set('Accept', /json/)
      .send({
        name: ''
      });

    const expectedErr = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"name" is not allowed to be empty',
      param: 'name',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedErr);

  });

});
