// Test file for Historic artists endpoint

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

const base = '/v1/historic';
const numHistoric = 17;

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
 * Historic Artists Endpoints Unit Tests
 * 
 * NOTE: all tests look at the production Firestore database
 */

// A test historic object with technically 'correct' schema
// Used to test POST endpoints and errors
const testHistoric = {
  id: 999,
  name: 'test historic',
  born: '2000',
  died: '2020',
  images: [
    {
      url: 'https://www.google.com',
      caption: 'this isn\'t a real image',
    }
  ],
  description: [
    'a single entry in the description'
  ]
};

// A test image object with 'correct' schema
// Used to test POST endpoints and errors
const testImage = {
  url: 'https://www.facebook.com',
  caption: 'this is just a test image',
};

/**
 * GET endpoints tests
 * 
 * Checks basic GET functionality to work as expected
 */
describe('GET endpoints', () => {

  it('GET /v1/historic', async () => {

    const res = await supertest(api).get(base);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(numHistoric);

  });

  it('GET /v1/historic/:id', async () => {

    // Assuming that there is at least one historic
    const res = await supertest(api).get(base + '/0');

    // Verify that the success response returns an object
    expect(res.status).toBe(OK);
    expect(typeof res.body).toEqual('object');

    const historic = res.body;

    // Verify the contents of the historic object
    expect(historic.id).toEqual(0);
    expect(historic.born.length).toBeGreaterThanOrEqual(4);
    expect(historic.born.length).toBeGreaterThanOrEqual(4);

    // Check that the description and images arrays both have entries
    expect(Array.isArray(historic.description)).toBe(true);
    expect(historic.description.length).toBeGreaterThan(0);

    expect(Array.isArray(historic.images)).toBe(true);
    expect(historic.images.length).toBeGreaterThan(0);

  });

  it('GET /v1/historic/:id/images', async () => {

    // Assuming there is at least one historic
    const res = await supertest(api).get(base + '/0/images');

    // Verify that the success response returns an array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);

    // Images should have at least on image object
    const images = res.body;
    expect(images.length).toBeGreaterThan(0);

    // Check the contents of image
    const image = images[0];
    expect(image.url).not.toBeUndefined();
    expect(image.caption).not.toBeUndefined();

  });

  it('GET /v1/historic/:id/description', async () => {

    // Assuming there is at least one historic
    const res = await supertest(api).get(base + '/0/description');

    // Verify success response returns array
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);

    const description = res.body;
    expect(description.length).toBeGreaterThan(0);

  });

});

/**
 * GET endpoint tests with errors
 * These endpoints should send identical errors
 */
describe('GET endpoint errors', () => {

  // Setup expected error
  let id = 999;

  const expectedError = {
    type: DOC_NOT_FOUND_ERR,
    code: INVALID_PARAMS.toString(),
    message: `The requested historic with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  it('GET /v1/historic/:id - nonexistent id', async () => {

    const response = await supertest(api).get(base + `/${id}`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);

  });

  it('GET /v1/historic/:id/images - nonexistent id', async() => {

    const response = await supertest(api).get(base + `/${id}/images`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);

  });

  it('GET /v1/historic/:id/description - nonexistent id', async() => {

    const response = await supertest(api).get(base + `/${id}/description`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);

  });

});

/**
 * POST endpoint tests
 * 
 * This test suite:
 * - creates a test/mock historic (still put in production database)
 * - performs POST requests on description and images
 * - deletes the test historic after all tests run
 * 
 */
describe('POST/DELETE endpoint tests', () => {

  // Mock historic/image/description to add for POST requests
  const testHistoric1 = testHistoric;

  // Construct another test historic with different ID
  const testHistoric2 = {
    ...testHistoric1,
    id: 1000
  };

  // Create test historics before running unit tests
  beforeAll(async () => {
    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testHistoric1)
      .expect(OK);

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testHistoric2)
      .expect(OK);
  });

  // Delete the test historic after tests
  afterAll(async () => {
    await supertest(api).delete(`${base}/${testHistoric1.id}`);
    await supertest(api).delete(`${base}/${testHistoric2.id}`);
  });

  it('POST /v1/historic - creates new historic', async () => {

    // Test historic has already been created in beforeEach block
    // Just check that it exists and is equal
    const response = await supertest(api).get(`${base}/${testHistoric1.id}`);
    expect(response.status).toBe(OK);
    expect(response.body).toEqual(testHistoric1);

  });

  it('POST /v1/historic/:id/images', async () => {
    
    let expectedNewLength = 2;

    const firstRes = await supertest(api)
      .post(`${base}/${testHistoric1.id}/images`)
      .set('Accept', /json/)
      .send(testImage);

    expect(firstRes.status).toBe(OK);
    expect(Array.isArray(firstRes.body)).toBe(true);
    expect(firstRes.body).toHaveLength(expectedNewLength);

    let images = [
      testImage,
      testImage,
      testImage
    ];

    // Make the new test images unique
    let i = 1;
    let newImages = images.map(img => (
      {
        url: img.url,
        caption: (i++).toString()
      }
    ));

    expectedNewLength = 4;

    const secondRes = await supertest(api)
      .post(`${base}/${testHistoric2.id}/images`)
      .set('Accept', /json/)
      .send(newImages);
    
      expect(secondRes.status).toBe(OK);
      expect(Array.isArray(secondRes.body)).toBe(true);
      expect(secondRes.body).toHaveLength(expectedNewLength);

  });

  it('POST /v1/historic/:id/description', async() => {

    const endpoint = `${base}/${testHistoric1.id}/description`;
    const newEntries = [
      'multiple entries...',
      '... added to description...',
      '... in an array!'
    ];

    // 1 original entry + 3 new entries
    const expectedNewLength = 4;
    
    const res = await supertest(api)
      .post(endpoint)
      .set('Accept', /json/)
      .send(newEntries);

    // Response should contain updated description
    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

});

/**
 * POST errors tests for /v1/historic ONLY
 * 
 * Sends a bunch of historic objects with incorrect schema
 * to test error responses/handling
 * 
 * Image schema errors are handled in another test section
 */
describe('POST /v1/historic errors', () => {
  
  it('tests for already existing id', async () => {

    const existingId = 0;  // assuming there's at least one existing historic
    const invalidUpdateReq = {
      ...testHistoric,
      id: existingId
    };

    // Valid historic, invalid request because id already exists
    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidUpdateReq);
    
    const expectedError = {
      type: DOC_ALRDY_EXISTS_ERR,
      code: INVALID_PARAMS.toString(),
      message: `The requested historic with id ${existingId} already exists!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests negative id', async () => {

    const negativeId = {
      ...testHistoric,
      id: -1
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(negativeId);

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"id" must be larger than or equal to 0',
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests non integer id', async () => {

    const nonIntegerId = {
      ...testHistoric,
      id: 0.5
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(nonIntegerId);
    
    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"id" must be an integer',
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests empty name', async () => {

    // Using unique ID for each test
    const emptyName = {
      ...testHistoric,
      id: 600,
      name: ''
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(emptyName);
    
    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"name" is not allowed to be empty',
      param: 'name',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests short birth date', async () => {

    const shortBirthDate = {
      ...testHistoric,
      id: 630,
      born: '200'
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(shortBirthDate);

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"born" length must be at least 4 characters long',
      param: 'born',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests short death date', async () => {

    const shortDeathDate = {
      ...testHistoric,
      id: 630,
      died: '200'
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(shortDeathDate);

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"died" length must be at least 4 characters long',
      param: 'died',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('empty description', async () => {

    // Using unique ID for each test
    const emptyDescription = {
      ...testHistoric,
      id: 602,
      description: []
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(emptyDescription);
    
    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"description" does not contain 1 required value(s)',
      param: 'description',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('empty images', async () => {
    
    // Using unique ID for each test
    const emptyImages = {
      ...testHistoric,
      id: 603,
      images: []
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(emptyImages);
    
    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"images" must contain at least 1 items',
      param: 'images',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * POST error tests for /v1/historic + /:id/images
 * 
 * Used to test image object schema validation
 * Separated test section since images are their own object with separate schema
 */
describe('POST /v1/historic + /:id/images schema errors', () => {

  it('POST /v1/historic - tests invalid URL', async() => {

    // Using unique ID for each test
    const invalidUrl = {
      ...testHistoric,
      id: 604,
      images: [
        {
          ...testImage,
          url: 'not a valid url lol'
        }
      ]
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidUrl);
    
    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"images[0].url" must be a valid uri',
      param: 'url',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /v1/historic - caption undefined', async() => {

    // Using unique ID for each test
    const captionUndefined = {
      ...testHistoric,
      id: 605,
      images: [
        {
          ...testImage,
          caption: undefined
        }
      ]
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(captionUndefined);
    
    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"images[0].caption" is required',
      param: 'caption',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /v1/historic/:id/images - empty url', async() => {

    // id shouldn't matter for error testing
    const id = 606;

    const emptyUrl = {
      ...testImage,
      url: undefined
    };

    const res = await supertest(api)
      .post(`${base}/${id}/images`)
      .set('Accept', /json/)
      .send(emptyUrl);
    
    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"url" is required',
      param: 'url',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /v1/historic/:id/images - nonexistent id', async() => {

    // this id won't exist
    const id = 607;

    // Valid image, nonexistent id
    const res = await supertest(api)
      .post(`${base}/${id}/images`)
      .set('Accept', /json/)
      .send(testImage);
    
    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: '422',
      message: `The requested historic with id ${id} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /v1/historic/:id/images - invalid image in array', async () => {

    // array of size 4 where array[2] is invalid
    const imagesArray = [
      testImage,
      testImage,
      {
        ...testImage,
        url: undefined
      },
      testImage
    ];

    const id = 608;

    const res = await supertest(api)
      .post(`${base}/${id}/images`)
      .set('Accept', /json/)
      .send(imagesArray);

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"url" is required',
      param: 'url',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * POST errors for description
 */
describe('POST /v1/historic/:id/description errors', () => {

  it('nonexistent id', async () => {
    // this id won't exist
    const id = 609;
    const description = [
      'test',
      'test'
    ];

    // Valid description, nonexistent id
    const res = await supertest(api)
      .post(`${base}/${id}/description`)
      .set('Accept', /json/)
      .send(description);

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: '422',
      message: `The requested historic with id ${id} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('incorrect type', async () => {
    
    const id = 610;

    // Send nothing, will get caught by type checking
    const res = await supertest(api)
      .post(`${base}/${id}/description`)
      .set('Accept', /json/)
      .send();

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'Body must be string or array of strings',
      param: null,
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * PUT tests for historics
 */
describe('PUT /v1/historic/:id updates historic', () => {

  const id = 500;

  // Setting up an initial historic which will have its values
  // updated to be the updated historic
  const initialHistoric = {
    ...testHistoric,
    id: id
  };

  const updatedHistoric = {
    name: 'the updated historic',
    born: 'May 1, 2000',
    died: 'May 1, 2020',
    description: [
      'this is the description...',
      '... of the updated historic'
    ],
    images: [
      testImage,
      testImage,
      testImage
    ]
  };

  // PUT and DELETE operations all use this endpoint
  const endpoint = `${base}/${initialHistoric.id}`

  // POST the historic before testing PUT operations
  beforeAll(async () => {

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(initialHistoric)
      .expect(OK);

  });

  // DELETE the historic after testing
  afterAll(async () => {
    await supertest(api).delete(endpoint);
  });

  it('updates historic', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send(updatedHistoric);

    expect(res.status).toBe(OK);
    expect(res.body).toEqual({
      ...updatedHistoric,
      id: initialHistoric.id
    });

  });

});

/**
 * PUT endpoint error tests
 * - test for trying to update id
 */
describe('PUT /v1/historic/:id errors', () => {

  const invalidId = 501;
  const endpoint = `${base}/${invalidId}`;

  it('tests for trying to update id (immutable)', async() => {

    const res = await supertest(api)
    .put(endpoint)
    .set('Accept', /json/)
    .send({id: 0}); 

    const expectedError = {
      type: IMMUTABLE_ATTR_ERR,
      code: INVALID_PARAMS.toString(),
      message: 'The attribute "id" is immutable and cannot be updated!',
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for nonexistent id', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({name: 'valid test name'});

    const expectedError = {
      type: DOC_NOT_FOUND_ERR,
      code: INVALID_PARAMS.toString(),
      message: `The requested historic with id ${invalidId} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for empty name', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({name: ''});

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"name" is not allowed to be empty',
      param: 'name',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for short birth date', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({born: '1'});

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"born" length must be at least 4 characters long',
      param: 'born',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests for short death date', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send({died: '1'});

    const expectedError = {
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"died" length must be at least 4 characters long',
      param: 'died',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});
