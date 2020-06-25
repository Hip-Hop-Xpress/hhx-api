# The Hip Hop Xpress API 🎧 
Welcome! 👋 

In the future, this wiki will be replacing the mess that is the [`README.md`](https://github.com/Hip-Hop-Xpress/hhx-api/blob/master/README.md) documentation. Right now, the wiki will be updated as features get implemented - the README will act as a guide and the Wiki will be more of a progress tracker.

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

[Click here to view all the endpoints!](Endpoints)
