// Test file for Projects endpoints

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const httpCodes = require('../errors/codes');
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

it('tests that this works', () => {

  expect(true).toBe(true);

});
