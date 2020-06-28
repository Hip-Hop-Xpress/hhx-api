// Exporting listening local server - runs only for tests

// Test the server manually by typing 'npm run server' in command line in 
// the /functions folder and using the given localhost URL

const app = require('./app');

let port = 3300;

// Listen on local server
const server = app.listen(process.env.PORT || port, () => {
  console.log(`Server now up and running on port ${port}!`);
});

module.exports = server;
