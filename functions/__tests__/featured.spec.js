// Test file for Featured artist endpoints

const supertest = require('supertest');

// Cloud functions test
const admin = require('firebase-admin');
const test = require('firebase-functions-test');
const sinon = require('sinon');
const api = require('../index').app;

// Constants
const { INVALID_PARAMS, OK } = require('../errors/codes');
const { 
  INVALID_REQUEST_ERR, 
  DOC_NOT_FOUND_ERR, 
  DOC_ALRDY_EXISTS_ERR,
  IMMUTABLE_ATTR_ERR
} = require('../errors/types');

const base = '/v1/featured';
const numFeatured = 1;

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
 * Featured Artist Endpoints Unit Tests
 * 
 * NOTE: all tests look at the production Firestore database
 */

// A test image object with correct schema
const testImage = {
  url: 'https://www.facebook.com',
  caption: 'this is just a test image',
};

// A test social media object with correct schema
const testSocial = {
  type: 'github',
  handle: 'Hip-Hop-Xpress',
  url: 'https://github.com/Hip-Hop-Xpress'
};

// A test featured artist object with correct schema
// Used to test POST endpoints and errors
const testFeatured = {
  id: 999,
  name: 'test artist',
  current: false,
  date: 'Summer 2020',
  bio: [
    'paragraph 1',
    'paragraph 2'
  ],
  headerImageUrl: 'https://www.google.com',
  images: [],
  socials: [
    testSocial
  ]
};

/**
 * GET endpoints tests
 * 
 * Checks basic GET functionality to work as expected
 */
describe('GET endpoints', () => {

  it('GET /v1/featured', async () => {

    const res = await supertest(api).get(base);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(numFeatured);

  });

  it('GET /v1/featured/:id', async () => {

    // Check first featured artist
    const res = await supertest(api).get(base + '/0');

    // Verify that the success response returns an object
    expect(res.status).toBe(OK);
    expect(typeof res.body).toEqual('object');

    const featured = res.body;

    // Verify the contents of the project object
    expect(featured.id).toEqual(0);
    expect(typeof featured.date).toEqual('string');
    expect(typeof featured.current).toEqual('boolean');
    expect(typeof featured.headerImageUrl).toEqual('string');

    // Check that bio and socials both have entries
    expect(Array.isArray(featured.bio)).toBe(true);
    expect(featured.bio.length).toBeGreaterThan(0);

    expect(Array.isArray(featured.socials)).toBe(true);
    expect(featured.socials.length).toBeGreaterThan(0);

    // Check that images length is >= 0
    expect(Array.isArray(featured.images)).toBe(true);
    expect(featured.images.length).toBeGreaterThanOrEqual(0);

  });

  it('GET /v1/featured/:id/bio', async () => {

    const res = await supertest(api).get(base + '/0/bio');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

  });

  it('GET /v1/featured/:id/socials', async () => {

    const res = await supertest(api).get(base + '/0/socials');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toBeGreaterThan(0);

  });

  it('GET /v1/featured/:id/images', async () => {

    const res = await supertest(api).get(base + '/0/description');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toBeGreaterThanOrEqual(0);

  });

});

/**
 * GET endpoint tests with errors
 * These endpoints should all test for nonexistent id error
 */
describe('GET endpoint errors', () => {

  // Setup expected error
  let id = 909;
  const expectedError = {
    type: DOC_NOT_FOUND_ERR,
    code: INVALID_PARAMS.toString(),
    message: `The requested project with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  it('GET /v1/featured/:id', async () => {});

  it('GET /v1/featured/:id/bio', async () => {});

  it('GET /v1/featured/:id/socials', async () => {});

  it('GET /v1/featured/:id/images', async () => {});

});

/**
 * POST featured artist endpoint test
 * - create a mock artist
 * - retrieve the artist and verify contents
 * - delete the artist and verify again
 */
describe('POST/GET/DELETE featured artist test', () => {

  // Create test featured artist before running unit tests
  beforeAll(async () => {
    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testFeatured)
      .expect(OK);
  });

  // Delete the test featuerd artist after tests
  afterAll(async () => {
    await supertest(api).delete(`${base}/${testFeatured.id}`);
  });

  it('POST /v1/featured - creates new artist', async () => {

    // Test artist has already been created in beforeAll block
    // Just check that it exists and is equal
    const res = await supertest(api).get(`${base}/${testFeatured.id}`);

    expect(res.status).toBe(OK);
    expect(res.body).toEqual(testFeatured);

  });

  it('POST /v1/featured/:id/bio', async() => {

    const endpoint = `${base}/${testFeatured.id}/bio`;
    const newEntries = [
      'multiple entries...',
      '... added to bio...',
      '... in an array!'
    ];

    const expectedNewLength = testFeatured.bio.length + newEntries.length;
    
    const res = await supertest(api)
      .post(endpoint)
      .set('Accept', /json/)
      .send(newEntries);

    // Response should contain updated bio
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

  it('POST /v1/featured/:id/images', async() => {

    const endpoint = `${base}/${testFeatured.id}/images`;
    const newImages = [
      testImage,
      testImage,
      testImage,
      testImage
    ];

    const expectedNewLength = testFeatured.images.length + newImages.length;
    
    const res = await supertest(api)
      .post(endpoint)
      .set('Accept', /json/)
      .send(newImages);

    // Response should contain updated images
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

  it('POST /v1/featured/:id/socials', async() => {

    const endpoint = `${base}/${testFeatured.id}/socials`;
    const newSocials = [
      testSocial,
      testSocial,
      testSocial,
      testSocial
    ];

    const expectedNewLength = testFeatured.socials.length + newSocials.length;
    
    const res = await supertest(api)
      .post(endpoint)
      .set('Accept', /json/)
      .send(newSocials);

    // Response should contain updated socials
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

});

/**
 * POST /featured endpoint errors
 * - trying to post existing doc
 * - invalid schema
 */
describe('POST /featured endpoint errors', () => {

  it('tests for existing document', async () => {

  });

  it('tests for negative id', async () => {});

  it('tests for empty name', async () => {});

  it('tests for short date', async () => {});

  it('tests for empty bio', async () => {});

  it('tests for invalid header image url', async () => {});

  it('tests for invalid image in array', async () => {});

  it('tests for empty socials', async () => {});

  it('tests for invalid social in array', async () => {});
  
});

/**
 * DELETE /featured endpoint errors
 * - trying to delete nonexistent doc
 */
describe('DELETE /featured endpoint errors', () => {

  it('tests for nonexistent doc', async () => {});

});

/**
 * POST /bio endpoint errors
 * - sending empty strings
 */
describe('POST /bio endpoint errors', () => {

  it('tests for nonexistent doc', async () => {});

  it('tests for incorrect type', async () => {});

});

/**
 * POST /images endpoint errors
 * - incorrect schema
 */
describe('POST /images endpoint errors', () => {

  it('tests for nonexistent doc', async () => {});

  it('tests for invalid url', async () => {});

  it('tests for undefined caption', async () => {});

});

/**
 * POST /socials endpoint errors
 * - incorrect schema
 */
describe('POST /socials endpoint errors', () => {

  it('tests for type that already exists', async () => {});

  it('tests for invalid type', async () => {});

  it('tests for empty handle', async () => {});

  it('tests for invalid url', async () => {});

});

/**
 * PUT /featured/:id test
 * - test for successful update of featured artist
 */
describe('PUT /featured/:id updates featured artist', () => {

  const id = 500;

  // Setting up an initial project which will have its values
  // updated to be the updated project
  const initialFeatured = {
    ...testFeatured,
    id: id
  };

  const updatedFeatured = {
    id: id,
    name: 'the updated featured artist',
    current: false,
    headerImageUrl: 'https://www.google.com',
    bio: [
      'this is...',
      '... an updated bio!'
    ],
    images: [],
    socials: [
      testSocial,
      testSocial
    ],
    date: 'January 2020',
  };

  // PUT and DELETE operations all use this endpoint
  const endpoint = `${base}/${initialFeatured.id}`;

  // POST the project before testing PUT operations
  beforeAll(async () => {

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(initialFeatured)
      .expect(OK);

  });

  // DELETE the project after testing
  afterAll(async () => {
    await supertest(api).delete(endpoint).expect(OK);
  });

  it('updates project', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({
        ...updatedFeatured,
        id: undefined  // id cannot be included in PUT requests
      });

    expect(res.status).toBe(OK);
    expect(res.body).toEqual(updatedFeatured);

  });

});

/**
 * PUT endpoint errors
 * - trying to update id
 * - incorrect schema
 */
describe('PUT endpoint errors', () => {

  it('tests for updating id (immutable)', async () => {});

  it('tests for empty name', async () => {});

  it('tests for updating nonexistent id', async () => {});

  it('tests for short date', async () => {});

  it('tests for empty bio', async () => {});

  it('tests for invalid header image url', async () => {});

  it('tests for empty socials', async () => {});

});
