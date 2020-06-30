// Test file for variations endpoints
// Refactored using this answer: https://stackoverflow.com/a/56987548

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const httpCodes = require('../errors/codes');
const errorTypes = require('../errors/types');
const base = '/v1/variations';
const numVariations = 2;

let adminInitStub;
const functionsTest = test();

beforeAll(async () => {
  adminInitStub = sinon.stub(admin, 'initializeApp');
});

afterAll(async () => {
  adminInitStub.restore();
  functionsTest.cleanup();
});

describe('Run test endpoints', () => {
  it('/alive', async () => {
    const res = await supertest(api).get('/alive');
    expect(res.status).toBe(httpCodes.OK);
    expect(res.text).toEqual('The Hip Hop Xpress API is alive!');
  });

  it('/hello-world', async () => {
    const res = await supertest(api).get('/hello-world');
    expect(res.status).toBe(httpCodes.OK);
    expect(res.text).toEqual('Hello World!');
  });
});

describe('GET endpoints', () => {
  it('/v1/variations', async () => {
    const res = await supertest(api).get(base);
    expect(res.status).toBe(httpCodes.OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(numVariations);
  });
});


/**
 * Test endpoints
 */
// describe('Run test endpoints', () => {
//   test('sends correct message for GET /alive', async () => {
//     const response = await supertest(app).get('/alive');

//     expect(response.status).toBe(httpCodes.OK);
//     expect(response.text).toEqual('The Hip Hop Xpress API is alive!');

//   });

//   test('sends correct message for GET /hello-world', async () => {
//     const response = await supertest(app).get('/hello-world');

//     expect(response.status).toBe(httpCodes.OK);
//     expect(response.text).toEqual('Hello World!');

//   });

// });

/**
 * Variations Endpoints Unit Tests
 * 
 * NOTE: all tests look at the production Firestore database
 * TODO: find a way to run unit tests using Firestore emulator instead of actual database
 */

/**
 * GET endpoints
 */
// describe('GET endpoint tests', () => {

//   test('GET /v1/variations - retrieves all variations', async () => {

//     const response = await supertest(app).get(base);

//     // GET /v1/variations should return an array of variation objects
//     // with 2 variations
//     expect(response.status).toBe(httpCodes.OK);
//     expect(Array.isArray(response.body)).toBe(true)
//     expect(response.body).toHaveLength(numVariations);

//   });

//   test('GET /v1/variations/:id - retrieves variation by ID', async () => {

//     // Assuming that there is at least one variation
//     const response = await supertest(app).get(base + '/0');

//     // Verify that the success response returns an object
//     expect(response.status).toBe(httpCodes.OK);
//     expect(typeof response.body).toEqual('object');

//     const variation = response.body;

//     // Verify the contents of the variation object
//     expect(variation.id).toEqual(0);
//     expect(variation.date).not.toBeUndefined();

//     // Check that the description and images arrays both have entries
//     expect(Array.isArray(variation.description)).toBe(true);
//     expect(variation.description.length).toBeGreaterThan(0);

//     expect(Array.isArray(variation.images)).toBe(true);
//     expect(variation.images.length).toBeGreaterThan(0);

//   });

//   test('GET /v1/variations/:id/images - retrieves images by ID', async () => {

//     // Assuming there is at least one variation
//     const response = await supertest(app).get(base + '/0/images');

//     // Verify that the success response returns an array
//     expect(response.status).toBe(httpCodes.OK);
//     expect(Array.isArray(response.body)).toBe(true);

//     // Images should have at least on image object
//     const images = response.body;
//     expect(images.length).toBeGreaterThan(0);

//     // Check the contents of image
//     const image = images[0];
//     expect(image.url).not.toBeUndefined();
//     expect(image.caption).not.toBeUndefined();
//     expect(image.componentImage).not.toBeUndefined();

//   });

//   test('GET /v1/variations/:id/description - retrieves desc by ID', async () => {

//     // Assuming there is at least one variation
//     const response = await supertest(app).get(base + '/0/description');

//     // Verify success response returns array
//     expect(response.status).toBe(httpCodes.OK);
//     expect(Array.isArray(response.body)).toBe(true);

//     const description = response.body;
//     expect(description.length).toBeGreaterThan(0);

//   });

// });

/**
 * GET endpoint tests with errors
 * These endpoints should send identical errors
 */
// describe('GET endpoint error tests', () => {

//   // Setup expected error
//   let id = 999;

//   const expectedError = {
//     type: 'id_not_found_error',
//     code: '422',
//     message: `The requested variation with id ${id} does not exist!`,
//     param: 'id',
//     original: null
//   };

//   test('GET /v1/variations/:id - nonexistent id', async () => {
//     // Using nonexistent id
//     const response = await supertest(app).get(base + `/${id}`);

//     expect(response.status).toBe(httpCodes.INVALID_PARAMS);
//     expect(response.body).toEqual(expectedError);
//   });

//   test('GET /v1/variations/:id/images - nonexistent id', async() => {
//     const response = await supertest(app).get(base + `/${id}/images`);

//     expect(response.status).toBe(httpCodes.INVALID_PARAMS);
//     expect(response.body).toEqual(expectedError);
//   });

//   test('GET /v1/variations/:id/description - nonexistent id', async() => {
//     const response = await supertest(app).get(base + `/${id}/description`);

//     expect(response.status).toBe(httpCodes.INVALID_PARAMS);
//     expect(response.body).toEqual(expectedError);
//   });

// });

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
// describe('POST endpoint tests', () => {

//   // Mock variation/image/description to add for POST requests
//   const testVariation = {
//     id: 999,
//     name: 'test variation',
//     date: '2020',
//     images: [
//       {
//         url: 'https://www.google.com',
//         caption: 'this isn\'t a real image',
//         componentImage: false,
//       }
//     ],
//     description: [
//       'a single entry in the description'
//     ]
//   };

//   const testImage = {
//     url: 'https://www.google.com',
//     caption: 'another test image',
//     componentImage: false
//   };

//   // Create test variation before each test
//   beforeEach(async () => {
//     await supertest(app)
//       .post(base)
//       .set('Accept', /json/)
//       .send(testVariation)
//       .expect(httpCodes.OK);
//   })

//   // Delete the test variation after testing
//   afterEach(async () => {
//     await supertest(app).delete(`${base}/${testVariation.id}`);
//   });

//   test('POST /v1/variations - creates new variation', async () => {

//     // Test variation has already been created in beforeEach block
//     // Just check that it exists and is equal
//     const response = await supertest(app).get(`${base}/${testVariation.id}`);
//     expect(response.status).toBe(httpCodes.OK);
//     expect(response.body).toEqual(testVariation);

//   });

//   test('POST /v1/variations/:id/images - add image', async () => {

//     const response = await supertest(app)
//       .post(`${base}/${testVariation.id}/images`)
//       .set('Accept', /json/)
//       .send(testImage);

//     const expectedNewLength = 2;  // original image + test image

//     // Response should contain updated images array
//     expect(response.status).toBe(httpCodes.OK);
//     expect(Array.isArray(response.body)).toBe(true);
//     expect(response.body).toHaveLength(expectedNewLength);
//     expect(response.body).toContainEqual(testImage);

//   });

//   test('POST /v1/variations/:id/images - add multiple images', async () => {

//     // An array of 3 test images
//     const imagesToAdd = [
//       testImage,
//       testImage,
//       testImage
//     ];

//     // original image + three new test images
//     const expectedNewLength = 4;

//     const response = await supertest(app)
//       .post(`${base}/${testVariation.id}/images`)
//       .set('Accept', /json/)
//       .send(imagesToAdd);

//     // Response should contain updated images array
//     expect(response.status).toBe(httpCodes.OK);
//     expect(Array.isArray(response.body)).toBe(true);
//     expect(response.body).toHaveLength(expectedNewLength);
//     expect(response.body).toContainEqual(testImage);

//   });

//   test('POST /v1/variations/:id/description - add entry', async() => {

//     const entry = 'entry to add to description';

//     // original entry + new entry
//     const expectedNewLength = 2;
    
//     const response = await supertest(app)
//       .post(`${base}/${testVariation.id}/description`)
//       .set('Accept', /json/)
//       .send(entry);

//     // Response should contain updated description
//     expect(response.status).toBe(httpCodes.OK);
//     expect(Array.isArray(response.body)).toBe(true);
//     expect(response.body).toHaveLength(expectedNewLength);
//     expect(response.body).toContainEqual(entry);

//   });

//   test('POST /v1/variations/:id/description - add multiple entries', async() => {

//     const entries = [
//       'multiple entries...',
//       '... added to description...',
//       '... in an array!'
//     ];

//     // original entry + 3 new entries
//     const expectedNewLength = 4;
    
//     const response = await supertest(app)
//       .post(`${base}/${testVariation.id}/description`)
//       .set('Accept', /json/)
//       .send(entries);

//     // Response should contain updated description
//     expect(response.status).toBe(httpCodes.OK);
//     expect(Array.isArray(response.body)).toBe(true);
//     expect(response.body).toHaveLength(expectedNewLength);

//   });

// });

// Required to close connection to server once tests are done
// afterAll(done => {
//   app.close();
//   done();
// });
