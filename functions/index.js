// Built initially using this guide:
// https://medium.com/better-programming/building-an-api-with-firebase-109041721f77

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));

var serviceAccount = require('./permissions.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hhx-api-48896.firebaseio.com/"
});

/**
 * Hip Hop Xpress Endpoint Imports
 */
const variations = require('./routes/variations');

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
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// FIXME: can't have module.exports and exports.app together :(

// Listen on web
exports.app = functions.https.onRequest(app);

module.exports = app;
