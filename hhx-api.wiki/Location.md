# Location endpoint
The Double Dutch Boom Bus is the current vehicle of the Hip Hop Xpress - the API Location endpoint serves as a method for users of the app to see the the bus's location.

*NOTE*: In the future, there will be a need for a more robust option of communicating the bus location to the user: for now, the naive solution will simply be a set of coordinates available for retrieval from the API.

## The Location object
```json
{
  "name": "University of Illinois at Urbana-Champaign Campustown",
  "latitude": 40.102,
  "longitude": -88.2272
}
```

### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`name` | `String` | must be non-empty | human-readable name of location
`latitude` | `number` | none, just required | latitude coordinate of location
`longitude` | `number` | none, just required | longitude coordinate of location

## Endpoints

### Overview
A quick overview of all endpoints related to the location:

```javascript
GET /v1/location
PUT /v1/location
```

### Usage
All use cases for the projects endpoints are listed below:

* [Retrieve location: `GET /v1/location`](#retrieve-location)
* [Update location: `PUT /v1/location`](#update-location)

---

### Retrieve location

`GET /v1/location`

Retrieves the location.

#### Parameters
None

#### Returns
The location object as specified [above](#the-location-object).

---

### Update location
`PUT /v1/location`

Updates the location based on the parameters. 

#### Parameters
An object containing only the attributes needing change, and their updated values. (For example, you can just include the `latitude` field in your request body without the `longitude` or `name` field, and it will update just the `latitude` field).

#### Returns
The updated location object

[**Back to top**](#location-endpoint)
