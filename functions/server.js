// Exporting listening local server - runs only for unit tests by jest

/**
 * Run unit tests using jest:               npm run test
 * Run local server (production Firestore): firebase emulators:start
 * Run local server (emulator Firestore):   npm run serve
 */

const app = require('./app');

let port = 3300;

// Listen on local server
const server = app.listen(process.env.PORT || port, () => {
  console.log(`Server now up and running on port ${port}!`);
});

module.exports = server;
