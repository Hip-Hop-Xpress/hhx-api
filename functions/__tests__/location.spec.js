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

describe('GET endpoint', () => {

  it('GET /v1/location', async () => {

  });

});

describe('PUT /v1/location', () => {

  it('updates name correctly', async () => {

  });

  it('updates latitude correctly', async () => {

  });

  it('updates longitude correctly', async () => {

  });

});

describe('PUT endpoint errors', () => {

  it('empty string', async () => {
    
  });

});
