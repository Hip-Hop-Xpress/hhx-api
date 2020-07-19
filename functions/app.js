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
const projects = require('./routes/projects');
const location = require('./routes/location');
const updates = require('./routes/updates');
const socials = require('./routes/socials');
const courses = require('./routes/courses');
const featured = require('./routes/featured');
const participants = require('./routes/participants');

// Error imports
const { URL_NOT_FOUND } = require('./errors/codes');
const { INVALID_ENDPOINT_ERR } = require('./errors/types');
const { constructServerError } = require('./errors/helpers');

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
app.use('/v1/variations',  variations);
app.use('/v1/projects',    projects);
app.use('/v1/location',    location);
app.use('/v1/updates',     updates);
app.use('/v1/socials',     socials);
app.use('/v1/courses',     courses);
app.use('/v1/featured',    featured);
app.use('/v1/participants', participants);

// For unhandled routes
app.all('*', (req, res, next) => {
  res.status(URL_NOT_FOUND).json({
    type: INVALID_ENDPOINT_ERR,
    code: URL_NOT_FOUND.toString(),
    message: `The requested URL ${req.originalUrl} was not found!`,
    id: 'URL',
    original: null
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  return constructServerError(res, err);
})

// Used by Firebase Functions in deployment (see index.js)
module.exports = app;