// File deployed by Firebase functions
// Implementation can be found at app.js

const functions = require('firebase-functions');
const app = require('./app')

// Listen on web
exports.app = functions.https.onRequest(app);
