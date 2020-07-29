# Tokens endpoint
The Hip Hop Xpress mobile app uses Expo to send push notifications to its users. This endpoint keeps track of *push tokens* used by Expo to send those notifications. 

Generally, this endpoint route should only be used by developers of the HHX mobile app, so the available endpoints are limited to those below:

```javascript
   POST /v1/tokens

    GET /v1/tokens/:id
    PUT /v1/tokens/:id
 DELETE /v1/tokens/:id
```

The documentation for this endpoint will also be limited.

## Schema
`POST` and `PUT` endpoints will evaluate each push token using methods provided by `expo-server-sdk`. If any requests contain invalid push tokens, they will return errors (of which the format is TBD).

# Endpoints:

## Register device's push token to collection
`POST /v1/tokens`

Upon startup of the app, the device will send its push token to this endpoint. If the push token is not already in the collection, it will be added - otherwise, no change occurs.


## Retrieve a device's push token
`GET /v1/tokens/:id`

If given an `id` of a push token in the collection, the endpoint will return the requested push token.

## Update a device's push token
`PUT /v1/tokens/:id`

Given an `id` and a valid push token in the request body, the endpoint will update the push token at that `id` and return the request body as is.

## Delete a device's push token
`DELETE /v1/tokens/:id`

Given an `id`, the endpoint will delete the push token at that `id`.
