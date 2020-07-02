// Built initially using this guide:
// https://medium.com/better-programming/building-an-api-with-firebase-109041721f77

const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

let serviceAccount = require('./permissions.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hhx-api-48896.firebaseio.com/"
});

app.use(bodyParser.json());  // included as a solution for testing
app.use(bodyParser.text());
app.use(cors({ origin: true }));

// Hip Hop Xpress Endpoint Imports
const variations = require('./routes/variations');

// Constants
const { URL_NOT_FOUND: NOT_FOUND } = require('./errors/codes');
const errorTypes = require('./errors/types');

/**
 * Test endpoints
 */

// GET /hello-world
app.get('/hello-world', (req, res) => {
  return res.status(200).send('Hello World!');
});

// GET alive
app.get('/alive', (req, res) => {
  return res.status(200).send('The Hip Hop Xpress API is alive!');
});

/**
 * Hip Hop Xpress Endpoint routes
 */
app.use('/v1/variations', variations);

// For unhandled routes
app.all('*', (req, res, next) => {
  res.status(NOT_FOUND).json({
    type: errorTypes.INVALID_ENDPOINT_ERR,
    code: NOT_FOUND.toString(),
    message: `The requested URL ${req.originalUrl} was not found!`,
    id: 'URL',
    original: null
  });
});

// Used by jest for running unit tests (see server.js)
// Used by Firebase Functions in deployment (see index.js)
module.exports = app;