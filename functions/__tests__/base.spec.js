// Test file for test endpoints

/**
 * Testing console commands
 * 
 * Run unit tests using jest:               npm run test
 * Run local server (emulator Firestore):   firebase emulators:start
 * Run local server (production Firestore): npm run serve
 */

const supertest = require('supertest');
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const httpCodes = require('../errors/codes');

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
 * Test endpoints
 */
describe('Run test endpoints', () => {

  it('/alive', async () => {

    const res = await supertest(api).get('/alive');
    const expectedMsg = 'The Hip Hop Xpress API is alive!';

    expect(res.status).toBe(httpCodes.OK);
    expect(res.text).toEqual(expectedMsg);

  });

  it('/hello-world', async () => {

    const res = await supertest(api).get('/hello-world');
    const expectedMsg = 'Hello World!';

    expect(res.status).toBe(httpCodes.OK);
    expect(res.text).toEqual(expectedMsg);

  });

});
