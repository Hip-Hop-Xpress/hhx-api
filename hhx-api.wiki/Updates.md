# Updates endpoint
The Hip Hop Xpress App will send users updates about events, courses, and other news regarding the Hip Hop Xpress and related organizations. This endpoint serves as a way for app clients to receive new updates.

### Guide
* [The Update object](#the-update-object)
  * [Attributes](#attributes)
* [Endpoints](#endpoints)
  * [Overview](#overview)
  * [Usage](#usage)

## The Update object
```json
{
  "id": 0,
  "title": "Double Dutch Boom Bus Playlists",
  "date": "Thu 14 May 2020",
  "author": "Hip Hop Xpress Admin",
  "body": [
    "As UIUC students wrap up their final exams of the semester, we want...",
    "Check them out on our Instagram! @uiuchhx"
  ],
}
```

### Attributes

Name | Type | Restrictions | Description
-|-|-|-
`id` | `number` | must be unique non-zero integer | unique identifier for update
`title` | `string` | must be non-empty | title of the update
`date` | `string` | date format follows the [`toDateString()` method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toDateString) of the [`Date` JavaScript Object type](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | the date the update is released
`author` | `string` | must be non-empty | the author of the update
`body` | `Array` of `string` | must be non-empty | body text of the update

## Endpoints

### Overview
A quick overview of all endpoints related to our updates:

```javascript
   POST /v1/updates
    GET /v1/updates

    GET /v1/updates/:id
    PUT /v1/updates/:id
 DELETE /v1/updates/:id

   POST /v1/updates/:id/body
    GET /v1/updates/:id/body
```

### Usage
All use cases for the updates endpoints are listed below.

**Collection wide:**
* [Create update: `POST /v1/updates`](#create-update)
* [Retrieve all updates: `GET /v1/updates`](#retrieve-all-updates)

**Update specific:**
* [Retrieve an update: `GET /v1/updates/:id`](#retrieve-update)
* [Update an update: `PUT /v1/updates/:id`](#update-update)
* [Delete an update: `DELETE /v1/updates/:id`](#delete-update)

**Update data specific:**
* [Add body text for update: `POST /v1/updates/:id/body`](#add-to-body)
* [Retrieve body text for update: `GET /v1/updates/:id/body`](#retrieve-body)

View the [error documentation](errors) for what to expect if your request fails.

---

### Create Update
`POST /v1/updates`

Creates an update by including an [update object](#the-update-object) (JSON) in the request body. All fields are required, and the `id` must be a unique, non-negative integer.

#### Parameters
A valid [update object](#the-update-object) (JSON) with correct attributes

#### Returns
The update object as added in the database

---

### Retrieve all updates
`GET /v1/updates`

Retrieves the data for all updates

#### Parameters
None

#### Returns
An array of all update objects

---

### Retrieve update
`GET /v1/updates/:id`

Retrieves a specific update through its `id`, with `:id` being the desired update's `id` field.

#### Parameters
None

#### Returns
The update object with specified `id`

---

### Update update
`PUT /v1/updates/:id`

Updates specific attributes of an update object with `id`

#### Parameters
An object containing only the attributes needing change, and their updated values. For example, if you need to change the `title` attribute, you only need to include the `title` field in your request: `{"title": "some new title"}`. However, any updated attributes must follow the [attribute restrictions](#attributes).

#### Returns
The updated update object

---

### Delete update
`DELETE /v1/updates/:id`

Deletes a specific update from the database by its `id`

#### Parameters
None

#### Returns
The update object that was deleted

---

### Add to body
`POST /v1/updates/:id/body`

Adds text to a update's body by including the desired text in the request body.

#### Parameters
Either a single `string` or an array of `string`s in the request body

#### Returns
The updated body (array of `string`s)

---

### Retrieve body
`GET /v1/updates/:id/body`

Retrieves all the text in a specific update's body

#### Parameters
None

#### Returns
The body (array of `string`s)

[**Back to top**](#updates-endpoint)