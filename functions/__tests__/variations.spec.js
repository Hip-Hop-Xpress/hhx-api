// Test file for variations endpoints

const supertest = require('supertest');
const app = require('../server');

describe('Testing the variations API', () => {

  it('tests the jest framework if it works', () => {
    expect(4).toBe(4);
  });

  it('tests the /alive route to verify connection to local server', async () => {
    const response = await supertest(app).get('/alive');

    expect(response.status).toBe(200);
    expect(response.text).toEqual('The Hip Hop Xpress API is alive!');
  });

  afterAll(done => {
    app.close();
    done();
  })

});
