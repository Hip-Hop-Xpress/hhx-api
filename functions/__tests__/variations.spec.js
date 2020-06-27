// Test file for variations endpoints

const supertest = require('supertest');
const app = require('../server');

describe('Testing the variations API', () => {
  it('tries connecting to test endpoints to verify connection', async () => {
    const response = await supertest(app).get('/alive');

    expect(response.status).toBe(200);
    expect(response.text).toEqual('The Hip Hop Xpress API is alive!');
  });

  // Required to close connection to server once tests are done
  afterAll(done => {
    app.close();
    done();
  })

});
