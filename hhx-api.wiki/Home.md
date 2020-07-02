# The Hip Hop Xpress API 🎧 
Welcome! 👋 

The goal for the wiki is to have all information needed for using the API, including endpoints, structure of body requests/results, error codes, etc.

## Introduction

The Hip Hop Xpress API serves as a connection point between the physical lab and clients/users of the mobile app, as well as other related applications. It is built around REST and HTTP, using `POST`, `GET`, `PUT`, and `DELETE` HTTP verbs. All response data will be returned as JSON.

This API has been implemented using [Express.js](https://expressjs.com/) and [Firebase](https://firebase.google.com/).

## Getting started

### Base URL
```
https://us-central1-hhx-api-48896.cloudfunctions.net/app
```
_Note_: This will likely change over the course of development.

### Test endpoints
Try these endpoints to make sure your connection to the API is working.
```javascript
GET /hello-world  // Hello World!
GET /alive        // The Hip Hop Xpress API is alive!
```

[View all the endpoints and the development progress!](Endpoints)
