# Variations endpoint
"Variations" hold data regarding past variations on the Hip Hop Xpress. You can view them on the Hip Hop Xpress website [here](https://publish.illinois.edu/hiphopxpress/sample-page/).

### Guide
* [The Variation object](#the-variation-object)
  * [Attributes](#attributes)
* [The Variation 'Image' object](#the-variation-'image'-object)
* [Endpoints](#endpoints)
  * [Overview](#overview)
  * [Usage](#usage)

## The Variation object
Each variation object holds data in JSON format. **All attributes are required in POST requests, but not in PUT requests** (see more [here](#create-variation)).
```json
{
  "id": 0,
  "name": "B.E.A.T.S. Trailer",
  "date": "2012-2018",
  "description": [
    "With the Airstream trailer no longer available, Dr. Patterson located...",
    "This trailer, too, required rental of a vehicle to pull it to various...",
  ],
  "images": [
    {
      "url": "https://publish.illinois.edu/.../IPoweredTrailer.jpg",
      "caption": "The B.E.A.T.S. trailer in action",
      "componentImage": true,
    },
    {
      "url": "https://publish.illinois.edu/.../HipHopXpressSideViewTrailer.jpg",
      "caption": "A side view of the B.E.A.T.S. trailer",
      "componentImage": false,
    },
  ]
}
```
### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`id` | `number` | must be unique non-zero integer | unique identifier for variation
`name` | `string` | must be non-empty | display name for variation
`date` | `string` | must be 4 characters or more | describes the running time of variation
`description` | `Array` of `string` | must be non-empty | describes the variation
`images` | `Array` of Image `Object`s | must be non-empty, exactly one Image `Object` must have `componentImage` set to `true` | lists all display images for variation

## The Variation 'Image' object
Image description for `images` array in the variation object. Each field is required when [creating new images.](#add-images)
```json
{
  "url": "https://publish.illinois.edu/.../IPoweredTrailer.jpg",
  "caption": "",
  "componentImage": true,
}
```
### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`url` | `string` | must be a valid URL | points to image of variation
`caption` | `string` | none, can be empty | briefly describes the image
`componentImage` | `boolean` | exactly one image must have `componentImage` set to `true` | describes whether this image is displayed on its component in the mobile app

## Endpoints

### Overview
A quick overview of all endpoints related to Variations on the Hip Hop Xpress
```javascript
   POST /v1/variations
    GET /v1/variations

    GET /v1/variations/:id
    PUT /v1/variations/:id
 DELETE /v1/variations/:id

   POST /v1/variations/:id/images
    GET /v1/variations/:id/images

   POST /v1/variations/:id/description
    GET /v1/variations/:id/description
```

### Usage
All use cases for the Variations endpoints are listed below.

**Collection wide:**
* [Create variation: `POST /v1/variations`](#create-variation)
* [Retrieve all variations: `GET /v1/variations`](#retrieve-all-variations)

**Variation specific:**
* [Retrieve a variation: `GET /v1/variations/:id`](#retrieve-variation)
* [Update a variation: `PUT /v1/variations/:id`](#update-variation)
* [Delete a variation: `DELETE /v1/variations/:id`](#delete-variation)

**Variation data specific:**
* [Add images for variation: `POST /v1/variations/:id/images`](#add-images)
* [Retrieve images for variation: `GET /v1/variations/:id/images`](#retrieve-images)
* [Add text to variation description: `POST /v1/variations/:id/description`](#add-to-description)
* [Retrieve variation's description: `GET /v1/variations/:id/description`](#retrieve-description)

View the [error documentation](errors) for what to expect if your request fails.


---

### Create variation 
`POST /v1/variations`

Creates a variation by including a [variation object](#the-variation-object) (JSON) in the request body. All fields are required, and the `id` must be a unique, non-negative integer.

#### Parameters
A valid [variation object](#the-variation-object) (JSON) with correct attributes

#### Returns
The variation object as added in the database if successful

---

### Retrieve all variations
`GET /v1/variations`

Retrieves the data for all variations

#### Parameters
None

#### Returns
An array of all variation objects

---

### Retrieve variation
`GET /v1/variations/:id`

Retrieves a specific variation through its `id`

#### Parameters
None

#### Returns
The variation object with specified `id`

---

### Update variation
`PUT /v1/variations/:id`

Updates attributes of a specified variation object by `id`

#### Parameters
A variation object containing only the attributes needing change, and their updated values. For example, if you need to change the `date` attribute, you only need to include the `date` field in your request: `{"date": "some new date"}`. However, any updated attributes must follow the [attribute restrictions](#attributes).

#### Returns
The updated variation object

---

### Delete variation
`DELETE /v1/variations/:id`

Deles a variation object with `id`

#### Parameters
None

#### Returns
The variation object that was deleted

---

### Add images
`POST /v1/variations/:id/images`

Adds images to a specific variation by including the [image objects](#the-variation-'image'-object) in your request body.

#### Parameters
Either a single image object or an array of image objects in the request body. All attributes are required for each image object.

#### Returns
The updated images array

---

### Retrieve images
`GET /v1/variations/:id/images`

Retrieves all the images for a specified variation by `id` 

#### Parameters
None

#### Returns
The images array of variation with specified `id`

---

### Add to description
`POST /v1/variations/:id/description`

Adds text to a variation's description by by including the text in the request body

#### Parameters
Either a single `string` or an array of `string`s in the request body

#### Returns
The updated description (array of `string`s)t

---

### Retrieve description
`GET /v1/variations/:id/description`

Retrieves all the text in a specific variation's description

#### Parameters
None

#### Returns
The description (array of `string`s)

[**Back to top**](#variations-endpoint)
