# Participants

### Guide
* [The Participant object](#the-participant-object)
  * [Attributes](#attributes)
* [The Participant 'Image' object](#the-participant-'image'-object)
* [Endpoints](#endpoints)
  * [Overview](#overview)
  * [Usage](#usage)

## The Participant object
Each participant object holds data in JSON format. **All attributes are required in POST requests, but not in PUT requests** (see more [here](#create-participant)).
```json
{
  "id": 0,
  "name": "Joe Bolton",
  "description": [
    "Joe Bolton grew up in Champaign, IL, and participated in activies at the Don...",
    "Some of his work is featured in an exhibit at...",
  ],
  "images": [
    {
      "url":"https://publish.illinois.edu/.../WillJoeBoomBoxBuild-300x225.jpg",
      "caption":"Joe Bolton on the right, showing a youth how to build a speaker in 2018."
    },
    {
      "url":"https://publish.illinois.edu/.../JoeBolton_YFeb2020-300x225.jpeg",
      "caption":"Display of Joe Bolton’s work, Art @ the Y"
    }
  ]
}
```
### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`id` | `number` | must be unique non-zero integer, cannot be updated once created | unique identifier for participant
`name` | `string` | must be non-empty | display name for participant
`description` | `Array` of `string` | must be non-empty | describes the participant
`images` | `Array` of Image `Object`s | must be non-empty, exactly one Image `Object` must have `componentImage` set to `true` | lists all display images for participant

## The Participant 'Image' object
Image description for `images` array in the participant object. Each field is required when [creating new images.](#add-images)
```json
{
  "url": "https://publish.illinois.edu/.../IPoweredTrailer.jpg",
  "caption": "",
}
```
### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`url` | `string` | must be a valid URL | points to image of participant
`caption` | `string` | none, can be empty | briefly describes the image

## Endpoints

### Overview
A quick overview of all endpoints related to Participants on the Hip Hop Xpress
```javascript
   POST /v1/participants
    GET /v1/participants

    GET /v1/participants/:id
    PUT /v1/participants/:id
 DELETE /v1/participants/:id

   POST /v1/participants/:id/images
    GET /v1/participants/:id/images

   POST /v1/participants/:id/description
    GET /v1/participants/:id/description
```

### Usage
All use cases for the Participants endpoints are listed below.

**Collection wide:**
* [Create participant: `POST /v1/participants`](#create-participant)
* [Retrieve all participants: `GET /v1/participants`](#retrieve-all-participants)

**Participant specific:**
* [Retrieve a participant: `GET /v1/participants/:id`](#retrieve-participant)
* [Update a participant: `PUT /v1/participants/:id`](#update-participant)
* [Delete a participant: `DELETE /v1/participants/:id`](#delete-participant)

**Participant data specific:**
* [Add images for participant: `POST /v1/participants/:id/images`](#add-images)
* [Retrieve images for participant: `GET /v1/participants/:id/images`](#retrieve-images)
* [Add text to participant description: `POST /v1/participants/:id/description`](#add-to-description)
* [Retrieve participant's description: `GET /v1/participants/:id/description`](#retrieve-description)

View the [error documentation](errors) for what to expect if your request fails.


---

### Create participant 
`POST /v1/participants`

Creates a participant by including a [participant object](#the-participant-object) (JSON) in the request body. All fields are required, and the `id` must be a unique, non-negative integer.

#### Parameters
A valid [participant object](#the-participant-object) (JSON) with correct attributes

#### Returns
The participant object as added in the database if successful

---

### Retrieve all participants
`GET /v1/participants`

Retrieves the data for all participants

#### Parameters
None

#### Returns
An array of all participant objects

---

### Retrieve participant
`GET /v1/participants/:id`

Retrieves a specific participant through its `id`

#### Parameters
None

#### Returns
The participant object with specified `id`

---

### Update participant
`PUT /v1/participants/:id`

Updates attributes of a specified participant object by `id`

#### Parameters
A participant object containing only the attributes needing change, and their updated values. For example, if you need to change the `date` attribute, you only need to include the `date` field in your request: `{"name": "some new name"}`. However, any updated attributes must follow the [attribute restrictions](#attributes).

#### Returns
The updated participant object

---

### Delete participant
`DELETE /v1/participants/:id`

Deles a participant object with `id`

#### Parameters
None

#### Returns
The participant object that was deleted

---

### Add images
`POST /v1/participants/:id/images`

Adds images to a specific participant by including the [image objects](#the-participant-'image'-object) in your request body.

#### Parameters
Either a single image object or an array of image objects in the request body. All attributes are required for each image object.

#### Returns
The updated images array

---

### Retrieve images
`GET /v1/participants/:id/images`

Retrieves all the images for a specified participant by `id` 

#### Parameters
None

#### Returns
The images array of participant with specified `id`

---

### Add to description
`POST /v1/participants/:id/description`

Adds text to a participant's description by by including the text in the request body

#### Parameters
Either a single `string` or an array of `string`s in the request body

#### Returns
The updated description (array of `string`s)t

---

### Retrieve description
`GET /v1/participants/:id/description`

Retrieves all the text in a specific participant's description

#### Parameters
None

#### Returns
The description (array of `string`s)

[**Back to top**](#participants-endpoint)
