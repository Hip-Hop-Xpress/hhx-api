// Test file for Participants endpoints

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

const base = '/v1/participants';
const numParticipants = 5;

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
 * Participants Endpoints Unit Tests
 * 
 * NOTE: all tests look at the production Firestore database
 */

// A test participant object with technically 'correct' schema
// Used to test POST endpoints and errors
const testParticipant = {
  id: 999,
  name: 'test participant',
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

  it('GET /v1/participants', async () => {

    const res = await supertest(api).get(base);

    expect(res.status).toBe(OK);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(numParticipants);

  });

  it('GET /v1/participants/:id', async () => {

    // Assuming that there is at least one participant
    const res = await supertest(api).get(base + '/0');

    // Verify that the success response returns an object
    expect(res.status).toBe(OK);
    expect(typeof res.body).toEqual('object');

    const participant = res.body;

    // Verify the contents of the participant object
    expect(participant.id).toEqual(0);

    // Check that the description and images arrays both have entries
    expect(Array.isArray(participant.description)).toBe(true);
    expect(participant.description.length).toBeGreaterThan(0);

    expect(Array.isArray(participant.images)).toBe(true);
    expect(participant.images.length).toBeGreaterThan(0);

  });

  it('GET /v1/participants/:id/images', async () => {

    // Assuming there is at least one participant
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
    expect(image.componentImage).not.toBeUndefined();

  });

  it('GET /v1/participants/:id/description', async () => {

    // Assuming there is at least one participant
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
    message: `The requested participant with id ${id} does not exist!`,
    param: 'id',
    original: null
  };

  it('GET /v1/participants/:id - nonexistent id', async () => {

    const response = await supertest(api).get(base + `/${id}`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);

  });

  it('GET /v1/participants/:id/images - nonexistent id', async() => {

    const response = await supertest(api).get(base + `/${id}/images`);

    expect(response.status).toBe(INVALID_PARAMS);
    expect(response.body).toEqual(expectedError);

  });

  it('GET /v1/participants/:id/description - nonexistent id', async() => {

    const response = await supertest(api).get(base + `/${id}/description`);

    expect(response.status).toBe(INVALID_PARAMS);
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
 * - creates a test/mock participant (still put in production database)
 * - performs POST requests on description and images
 * - deletes the test participant after all tests run
 * 
 */
describe('POST endpoint tests (tests DELETE too)', () => {

  // Mock participant/image/description to add for POST requests
  const testParticipant1 = testParticipant;

  // Construct another test participant with different ID
  const testParticipant2 = {
    ...testParticipant1,
    id: 1000
  };

  // Create test participants before running unit tests
  beforeAll(async () => {
    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testParticipant1)
      .expect(OK);

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(testParticipant2)
      .expect(OK);
  });

  // Delete the test participant after tests
  afterAll(async () => {
    await supertest(api).delete(`${base}/${testParticipant1.id}`);
    await supertest(api).delete(`${base}/${testParticipant2.id}`);
  });

  it('POST /v1/participants - creates new participant', async () => {

    // Test participant has already been created in beforeEach block
    // Just check that it exists and is equal
    const response = await supertest(api).get(`${base}/${testParticipant1.id}`);
    expect(response.status).toBe(OK);
    expect(response.body).toEqual(testParticipant1);

  });

  it('POST /v1/participants/:id/images', async () => {
    
    let expectedNewLength = 2;

    const firstRes = await supertest(api)
      .post(`${base}/${testParticipant1.id}/images`)
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
        componentImage: false,
        caption: (i++).toString()
      }
    ));

    expectedNewLength = 4;

    const secondRes = await supertest(api)
      .post(`${base}/${testParticipant2.id}/images`)
      .set('Accept', /json/)
      .send(newImages);
    
      expect(secondRes.status).toBe(OK);
      expect(Array.isArray(secondRes.body)).toBe(true);
      expect(secondRes.body).toHaveLength(expectedNewLength);

  });

  it('POST /v1/participants/:id/description', async() => {

    const endpoint = `${base}/${testParticipant1.id}/description`;
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
 * POST errors tests for /v1/participants ONLY
 * 
 * Sends a bunch of participant objects with incorrect schema
 * to test error responses/handling
 * 
 * Image schema errors are handled in another test section
 */
describe('POST /v1/participants errors', () => {
  
  it('tests for already existing id', async () => {

    const existingId = 0;  // assuming there's at least one existing participant
    const invalidUpdateReq = {
      ...testParticipant,
      id: existingId
    };

    // Valid participant, invalid request because id already exists
    const res = await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(invalidUpdateReq);
    
    const expectedError = {
      type: DOC_ALRDY_EXISTS_ERR,
      code: INVALID_PARAMS.toString(),
      message: `The requested participant with id ${existingId} already exists!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('tests negative id', async () => {

    const negativeId = {
      ...testParticipant,
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
      ...testParticipant,
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
      ...testParticipant,
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

  it('empty description', async () => {

    // Using unique ID for each test
    const emptyDescription = {
      ...testParticipant,
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
      ...testParticipant,
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
 * POST error tests for /v1/participants + /:id/images
 * 
 * Used to test image object schema validation
 * Separated test section since images are their own object with separate schema
 */
describe('POST /v1/participants + /:id/images schema errors', () => {

  it('POST /v1/participants - tests invalid URL', async() => {

    // Using unique ID for each test
    const invalidUrl = {
      ...testParticipant,
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

  it('POST /v1/participants - caption undefined', async() => {

    // Using unique ID for each test
    const captionUndefined = {
      ...testParticipant,
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

  it('POST /v1/participants/:id/images - empty url', async() => {

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

  it('POST /v1/participants/:id/images - nonexistent id', async() => {

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
      message: `The requested participant with id ${id} does not exist!`,
      param: 'id',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

  it('POST /v1/participants/:id/images - invalid image in array', async () => {

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
      type: INVALID_REQUEST_ERR,
      code: INVALID_PARAMS.toString(),
      message: '"componentImage" is required',
      param: 'componentImage',
      original: null
    };

    expect(res.status).toBe(INVALID_PARAMS);
    expect(res.body).toEqual(expectedError);

  });

});

/**
 * POST errors for description
 */
describe('POST /v1/participants/:id/description errors', () => {

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
      message: `The requested participant with id ${id} does not exist!`,
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
 * PUT tests for participants
 */
describe('PUT /v1/participants/:id updates participant', () => {

  const id = 500;

  // Setting up an initial participant which will have its values
  // updated to be the updated participant
  const initialParticipant = {
    ...testParticipant,
    id: id
  };

  const updatedParticipant = {
    name: 'the updated participant',
    description: [
      'this is the description...',
      '... of the updated participant'
    ],
    images: [
      testImage,
      testImage,
      testImage
    ]
  };

  // PUT and DELETE operations all use this endpoint
  const endpoint = `${base}/${initialParticipant.id}`

  // POST the participant before testing PUT operations
  beforeAll(async () => {

    await supertest(api)
      .post(base)
      .set('Accept', /json/)
      .send(initialParticipant)
      .expect(OK);

  });

  // DELETE the participant after testing
  afterAll(async () => {
    await supertest(api).delete(endpoint);
  });

  it('updates participant', async () => {

    const res = await supertest(api)
      .put(endpoint)
      .set('Accept', /json/)
      .send(updatedParticipant);

    expect(res.status).toBe(OK);
    expect(res.body).toEqual({
      ...updatedParticipant,
      id: initialParticipant.id
    });

  });

});

/**
 * PUT endpoint error tests
 * - test for trying to update id
 */
describe('PUT /v1/participants/:id errors', () => {

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
      message: `The requested participant with id ${invalidId} does not exist!`,
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

});
