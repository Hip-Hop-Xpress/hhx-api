// Starter code for Updates

const supertest = require('supertest'); 
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { OK, INVALID_PARAMS } = require('../errors/codes');
const { INVALID_REQUEST_ERR } = require('../errors/types');
const base = '/v1/updates';

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
 * Test GET endpoints (uses prod database)
 */
describe('GET endpoints', () => {});

/**
 * GET endpoint tests with errors
 * - These endpoints should send identical errors
 */
describe('GET endpoint errors', () => {});

/**
 * POST endpoint tests
 *
 * This test suite:
 * - creates a mock update in the database
 * - performs POST requests on the update body
 * - deletes mock update afterwards
 */
describe('POST endpoint tests (tests /DELETE too)', () => {});

/**
 * POST endpoint errors
 * - schema errors
 * - nonexistent ID errors
 */
describe('POST endpoint error tests', () => {});

/**
 * PUT endpoint test
 * - tests individual fields to ensure that everything updates correctly
 */
describe('PUT /v1/updates/:id updates the update', () => {});

/**
 * PUT endpoint errors
 * - schema errors
 * - nonexistent ID errors
 */
describe('PUT /v1/updates/:id errors', () => {});




