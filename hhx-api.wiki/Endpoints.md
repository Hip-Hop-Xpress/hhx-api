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
Endpoints here are implemented primarily for the mobile app, but can be used elsewhere. As development continues, more documentation will be added for reference and you'll be able to see the progress here.

All endpoints in Version 1 of the API will be prefaced with `/v1`.

You can also view the [error documentation](Errors) for planning on handling errors.

### Version 1 endpoints:
A quick explanation of the table:
* *Implemented* = Initial draft of endpoint has been written and likely deployed for testing
* *Tested* = Test suite written and passed
* *Connected to App* = App uses endpoint for fetching data

Endpoint | Implemented | Tested | Connected to App
-|-|-|-
Historical artists | :x: | :x: | :x:
[Variations](variations) | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
Courses | :x: | :x: | :x:
[Projects](projects) | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark:
Featured artists | :x: | :x: | :x:
[Updates](updates) | :heavy_check_mark: | :heavy_check_mark: | :x:
[Location](location) | :heavy_check_mark: | :heavy_check_mark: | :x:
[Social Media](social-media) | :x: | :x: | :x: