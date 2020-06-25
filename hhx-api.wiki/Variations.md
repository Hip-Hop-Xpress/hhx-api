# Variations endpoint
"Variations" hold data regarding past variations on the Hip Hop Xpress. You can view them on the Hip Hop Xpress website [here](https://publish.illinois.edu/hiphopxpress/sample-page/).

## The Variation object
Each Variation object holds data in JSON format. **All attributes are required in POST requests, but not in PUT requests** (see more [here](#create-variation)).
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
`id` | `number` | must be unique non-zero integer | unique identifier for Variation
`name` | `string` | must be non-empty | display name for Variation
`date` | `string` | must be 4 characters or more | describes the running time of Variation
`description` | `Array` of `string` | must be non-empty | describes the Variation
`images` | `Array` of Image `Object`s | must be non-empty, exactly one Image `Object` must have `componentImage` set to `true` | lists all display images for Variation

## The Variation 'Image' object
Image description for `images` array in the Variation object. Each field is required when [creating new images.](#add-images)
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
`url` | `string` | must be a valid URL | points to image of Variation
`caption` | `string` | none, can be empty | briefly describes the image
`componentImage` | `boolean` | exactly one image must have `componentImage` set to `true` | describes whether this image is displayed on its component in the mobile app

## Endpoints

*This section is a work in progress.* :pick:

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
All use cases for the Variations endpoints:

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

### Create variation

### Retrieve all variations

### Retrieve variation

### Update variation

### Delete variation

### Add images

### Retrieve images

### Add to description

### Retrieve description



