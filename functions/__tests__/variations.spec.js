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
 * TODO: move these to a different file
 */
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


/**
 * Variations Endpoints Unit Tests
 * 
 * NOTE: all tests look at the production Firestore database
 * TODO: find a way to run unit tests using Firestore emulator instead of actual database
 *       I've tried doing this but it's hard and may take a while. Will try with another collection
 */

// A test variation object with technically 'correct' schema
// Used to test POST endpoints and errors
const testVariation = {
  id: 999,
  name: 'test variation',
  date: '2020',
  images: [
    {
      url: 'https://www.google.com',
      caption: 'this isn\'t a real image',
      componentImage: false,
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
  componentImage: true,
};

// GET Endpoints
describe('GET endpoints', () => {

  it('GET /v1/variations', async () => {

    const res = await supertest(api).get(base);

    expect(res.status).toBe(httpCodes.OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(numVariations);

  });

  it('GET /v1/variations/:id', async () => {

    // Assuming that there is at least one variation
    const res = await supertest(api).get(base + '/0');

    // Verify that the success response returns an object
    expect(res.status).toBe(httpCodes.OK);
    expect(typeof res.body).toEqual('object');

    const variation = res.body;

    // Verify the contents of the variation object
    expect(variation.id).toEqual(0);
    expect(variation.date).not.toBeUndefined();

    // Check that the description and images arrays both have entries
    expect(Array.isArray(variation.description)).toBe(true);
    expect(variation.description.length).toBeGreaterThan(0);

    expect(Array.isArray(variation.images)).toBe(true);
    expect(variation.images.length).toBeGreaterThan(0);

  });

  it('GET /v1/variations/:id/images', async () => {

    // Assuming there is at least one variation
    const res = await supertest(api).get(base + '/0/images');

    // Verify that the success response returns an array
    expect(res.status).toBe(httpCodes.OK);
    expect(Array.isArray(res.body)).toBe(true);

    // Images should have at least on image object
    const images = res.body;
    expect(images.length).toBeGreaterThan(0);

    // Check the contents of image
    const image = images[0];
    expect(image.url).not.toBeUndefined();
    expect(image.caption).not.toBeUndefined();
    expect(image.componentImage).not.toBeUndefined();

  });

  it('GET /v1/variations/:id/description', async () => {

    // Assuming there is at least one variation
    const res = await supertest(api).get(base + '/0/description');

    // Verify success response returns array
    expect(res.status).toBe(httpCodes.OK);
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
    type: 'id_not_found_error',
    code: '422',
    message: `The requested variation with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  it('GET /v1/variations/:id - nonexistent id', async () => {
    // Using nonexistent id
    const response = await supertest(api).get(base + `/${id}`);

    expect(response.status).toBe(httpCodes.INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  it('GET /v1/variations/:id/images - nonexistent id', async() => {
    const response = await supertest(api).get(base + `/${id}/images`);

    expect(response.status).toBe(httpCodes.INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

  it('GET /v1/variations/:id/description - nonexistent id', async() => {
    const response = await supertest(api).get(base + `/${id}/description`);

    expect(response.status).toBe(httpCodes.INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);
  });

});

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
describe('POST endpoint tests (tests /DELETE too)', () => {

  // Mock variation/image/description to add for POST requests
  const testVariation1 = testVariation;

  // Construct another test variation with different ID
  const testVariation2 = {
    ...testVariation1,
    id: 1000
  };

  const testImage = {
    url: 'https://www.google.com',
    caption: 'another test image',
    componentImage: false
  };

  // Create test variations before running unit tests
  beforeAll(async () => {
    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testVariation1)
      .expect(httpCodes.OK);

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testVariation2)
      .expect(httpCodes.OK);
  });

  // Delete the test variation after tests
  afterAll(async () => {
    await supertest(api).delete(`${base}/${testVariation1.id}`);
    await supertest(api).delete(`${base}/${testVariation2.id}`);
  });

  it('POST /v1/variations - creates new variation', async () => {

    // Test variation has already been created in beforeEach block
    // Just check that it exists and is equal
    const response = await supertest(api).get(`${base}/${testVariation1.id}`);
    expect(response.status).toBe(httpCodes.OK);
    expect(response.body).toEqual(testVariation1);

  });

  it('POST /v1/variations/:id/images', async () => {
    
    let expectedNewLength = 2;

    const firstRes = await supertest(api)
      .post(`${base}/${testVariation1.id}/images`)
      .set('Accept', /json/)
      .send(testImage);

    expect(firstRes.status).toBe(httpCodes.OK);
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
        componentImage: false,
        caption: (i++).toString()
      }
    ));

    expectedNewLength = 4;

    const secondRes = await supertest(api)
      .post(`${base}/${testVariation2.id}/images`)
      .set('Accept', /json/)
      .send(newImages);
    
      expect(secondRes.status).toBe(httpCodes.OK);
      expect(Array.isArray(secondRes.body)).toBe(true);
      expect(secondRes.body).toHaveLength(expectedNewLength);

  });

  it('POST /v1/variations/:id/description', async() => {

    const endpoint = `${base}/${testVariation1.id}/description`;
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
    expect(res.status).toBe(httpCodes.OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(expectedNewLength);

  });

});

/**
 * POST errors tests for /v1/variations ONLY
 * 
 * Sends a bunch of variation objects with incorrect schema
 * to test error responses/handling
 * 
 * Image schema errors are handled in another test section
 */
describe('POST /v1/variations schema errors', () => {
  
  it('tests negative id', async () => {

    const negativeId = {
      ...testVariation,
      id: -1
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(negativeId);

    const expectedError = {
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"id" must be larger than or equal to 0',
      param: 'id',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests non integer id', async () => {

    const nonIntegerId = {
      ...testVariation,
      id: 0.5
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(nonIntegerId);
    
    const expectedError = {
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"id" must be an integer',
      param: 'id',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests empty name', async () => {

    // Using unique ID for each test
    const emptyName = {
      ...testVariation,
      id: 600,
      name: ''
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(emptyName);
    
    const expectedError = {
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"name" is not allowed to be empty',
      param: 'name',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests short date', async () => {

    // Using unique ID for each test
    const shortDate = {
      ...testVariation,
      id: 601,
      date: '200'
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(shortDate);
    
    const expectedError = {
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"date" length must be at least 4 characters long',
      param: 'date',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('empty description', async () => {

    // Using unique ID for each test
    const emptyDescription = {
      ...testVariation,
      id: 602,
      description: []
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(emptyDescription);
    
    const expectedError = {
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"description" does not contain 1 required value(s)',
      param: 'description',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('empty images', async () => {
    
    // Using unique ID for each test
    const emptyImages = {
      ...testVariation,
      id: 603,
      images: []
    };

    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(emptyImages);
    
    const expectedError = {
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"images" must contain at least 1 items',
      param: 'images',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * POST error tests for /v1/variations + /:id/images
 * 
 * Used to test image object schema validation
 * Separated test section since images are their own object with separate schema
 */
describe('POST /v1/variations + /:id/images schema errors', () => {

  it('POST /v1/variations - tests invalid URL', async() => {

    // Using unique ID for each test
    const invalidUrl = {
      ...testVariation,
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
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"images[0].url" must be a valid uri',
      param: 'url',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /v1/variations - caption undefined', async() => {

    // Using unique ID for each test
    const captionUndefined = {
      ...testVariation,
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
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"images[0].caption" is required',
      param: 'caption',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /v1/variations/:id/images - empty url', async() => {

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
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"url" is required',
      param: 'url',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /v1/variations/:id/images - nonexistent id', async() => {

    // this id won't exist
    const id = 607;

    // Valid image, nonexistent id
    const res = await supertest(api)
      .post(`${base}/${id}/images`)
      .set('Accept', /json/)
      .send(testImage);
    
    const expectedError = {
      type: 'id_not_found_error',
      code: '422',
      message: `The requested variation with id ${id} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /v1/variations/:id/images - invalid image in array', async () => {

    // array of size 4 where array[2] is invalid
    const imagesArray = [
      testImage,
      testImage,
      {
        ...testImage,
        componentImage: undefined
      },
      testImage
    ];

    const id = 608;

    const res = await supertest(api)
      .post(`${base}/${id}/images`)
      .set('Accept', /json/)
      .send(imagesArray);

    const expectedError = {
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: '"componentImage" is required',
      param: 'componentImage',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * POST errors for description
 */
describe('POST /v1/variations/:id/description errors', () => {

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
      type: 'id_not_found_error',
      code: '422',
      message: `The requested variation with id ${id} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
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
      type: errorTypes.INVALID_REQUEST_ERR,
      code: httpCodes.INVALID_PARAMS.toString(),
      message: 'Body must be string or array of strings',
      param: null,
      original: null
    };

    expect(res.status).toBe(httpCodes.INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

describe('PUT /v1/variations/:id', () => {

  // Setting up an initial variation which will have its values
  // updated to be the updated variation
  const initialVariation = testVariation;

  const updatedVariation = {
    id: 500,
    name: 'the updated variation',
    date: '2021',
    description: [
      'this is the description...',
      '... of the updated variation'
    ],
    images: [
      testImage,
      testImage,
      testImage
    ]
  };

});
