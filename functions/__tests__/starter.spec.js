// Starter code for test files
// This will contain a bunch of comments for explanation

/**
 * Testing commands
 * 
 * Run unit tests using jest and coverage:  npm run test
 * Run local server (emulator Firestore):   firebase emulators:start
 * Run local server (production Firestore): npm run serve
 */

// supertest allows us to make API calls directly using the code
const supertest = require('supertest'); 

// allows us to initialize the express app
const admin = require('firebase-admin');

// allows us to cleanup after testing
const test = require('firebase-functions-test');

// used to make a dummy function call that initializes the app for testing
const sinon = require('sinon');

// the actual API code imported from index.js
const api = require('../index').app;

// Constants - these are for status codes, error strings, etc.
const { OK, INVALID_PARAMS } = require('../errors/codes');
const { INVALID_REQUEST_ERR } = require('../errors/types');

// TODO: write the URL endpoint here
const base = '/v1/___';  // this is the base endpoint URL that this route goes to

/* Boilerplate */
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
/* End boilerplate */

/**
 * TODO: write tests below!
 */

/**
 * A dummy test to show the syntax for writing unit tests using Jest
 */
describe('The test group name goes here', () => {

  // Here you write your individual unit tests
  it('tests that 1 + 1 === 2', async () => {  // don't forget the async keyword

    /**
     * There are lots of keywords that Jest uses (like expect, toBe, toEqual) that
     * VSCode doesn't really pick up with its intellisense, so refer to the other
     * test files for examples of keywords you can use
     */
    expect(1 + 1).toBe(2);

  });

});
