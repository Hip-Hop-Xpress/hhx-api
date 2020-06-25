# All Endpoints

Listed here are all the endpoints for the Hip Hop Xpress API.

## Base URL
```
https://us-central1-hhx-api-48896.cloudfunctions.net/app
```
_Note_: This will likely change over the course of development.

## Test endpoints
Try these endpoints to make sure your connection to the API is working.
```javascript
GET /hello-world  // Hello World!
GET /alive        // The Hip Hop Xpress API is alive!
```

## Version 1
Endpoints here are implemented primarily for the mobile app, but can be used elsewhere. As development continues, more documentation will be added for reference.

All endpoints in Version 1 of the API will be prefaced with `/v1` - if forgotten, the server will send a `404` JSON response.

**Version 1 endpoints:**
* Historical artists
* [Variations](variations)
* Courses
* Projects
* Featured artists
* Updates
* Location
* Social Media