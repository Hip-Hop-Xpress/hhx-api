# Featured artists endpoint
The Hip Hop Xpress aims to feature talented artists in the Champaign-Urbana area. This endpoint serves as a way to gather information about these talented artists.

### Guide
* [The Featured artist object](#the-featured-artist-object)
  * [Attributes](#attributes)
* [The Featured artist 'Image' object](#the-featured-artist-'image'-object)
* [Endpoints](#endpoints)
  * [Overview](#overview)
  * [Usage](#usage)

## The Featured artist object
Each featured artist object holds data in JSON format. **All attributes are required in POST requests, but not in PUT requests** (see more [here](#create-featured-artist)).
```json
{
  "id": 0,
  "name": "BUD LASER",
  "current": true,
  "date": "Summer 2020",
  "bio": [
    "Composer/Producer/DJ/Sound Design & Engineer from Champaign, IL, BUD LASER is..."
  ],
  "headerImageUrl": "https://www.publish.illinois.edu/.../BudLaserLogo.jpg",
  "images": [
    {
      "url": "https://www.publish.illinois.edu/.../BudLaserProfile.jpg",
      "caption": "Bud Laser in the Studio"
    }
  ],
  "socials": [
    {
      "type": "instagram",
      "handle": "@budlaser",
      "url": "https://www.instagram.com/budlaser/"
    }
  ]
}
```
### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`id` | `number` | must be unique non-zero integer, cannot be updated once created | unique identifier for featured artist
`name` | `string` | must be non-empty | display name for featured artist
`current` | `boolean` | only one featured artist will have `current` set to true | whether this artist is the currently featured artist
`date` | `string` | must be 4 characters or more | describes the time period that the artist was featured
`bio` | `Array` of `string` | must be non-empty | describes the featured artist
`headerImageUrl` | `string` | must be a valid url | the main image of the artist, to be displayed as a header or other prominent feature
`images` | `Array` of image `Object`s | can be empty, contents must follow the image schema | all images to be displayed for this artist
`socials` | `Array` of Social media `Object`s | must be non-empty, contents must follow the Social media object schema (see below)| lists all social media platforms for featured artist

## The Image object
Image object schema for `images` array in the featured artist object. Each field is required when [creating new images.](#add-images)
```json
{
  "url": "https://www.publish.illinois.edu/.../BudLaserProfile.jpg",
  "caption": "Bud Laser in the Studio"
}
```

### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`url` | `string` | must be a valid URL | points to image of featured artist
`caption` | `string` | none, can be empty | briefly describes the image

## The Social media object
Social media schema for `socials` array in the featured artist object. Each field is required when [creating new images.](#add-images)
```json
{
  "type": "instagram",
  "handle": "@budlaser",
  "url": "https://www.instagram.com/budlaser/"
}
```

### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`type` | `string` | must be a social media type as listed [here](https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type), cannot be updated once created | the specific social media platform, also specifies which platform to render on buttons and other components
`handle` | `string` | must be nonempty | the social media handle/username
`url` | `string` | must be a valid url | the social media URL

## Endpoints

### Overview
A quick overview of all endpoints related to Featured artists on the Hip Hop Xpress
```javascript
   POST /v1/featured artists
    GET /v1/featured artists

    GET /v1/featured artists/:id
    PUT /v1/featured artists/:id
 DELETE /v1/featured artists/:id

   POST /v1/featured artists/:id/images
    GET /v1/featured artists/:id/images

   POST /v1/featured artists/:id/description
    GET /v1/featured artists/:id/description
```

### Usage
All use cases for the Featured artists endpoints are listed below.

**Collection wide:**
* [Create featured artist: `POST /v1/featured artists`](#create-featured-artist)
* [Retrieve all featured artists: `GET /v1/featured artists`](#retrieve-all-featured-artists)

**Featured artist specific:**
* [Retrieve a featured artist: `GET /v1/featured artists/:id`](#retrieve-featured-artist)
* [Update a featured artist: `PUT /v1/featured artists/:id`](#update-featured-artist)
* [Delete a featured artist: `DELETE /v1/featured artists/:id`](#delete-featured-artist)

**Featured artist data specific:**
* [Add images for featured artist: `POST /v1/featured artists/:id/images`](#add-images)
* [Retrieve images for featured artist: `GET /v1/featured artists/:id/images`](#retrieve-images)
* [Add text to featured artist description: `POST /v1/featured artists/:id/description`](#add-to-description)
* [Retrieve featured artist's description: `GET /v1/featured artists/:id/description`](#retrieve-description)

View the [error documentation](errors) for what to expect if your request fails.

---

### Create featured artist 
`POST /v1/featured artists`

Creates a featured artist by including a [featured artist object](#the-featured-artist-object) (JSON) in the request body. All fields are required, and the `id` must be a unique, non-negative integer.

#### Parameters
A valid [featured artist object](#the-featured-artist-object) (JSON) with correct attributes

#### Returns
The featured artist object as added in the database if successful

---

### Retrieve all featured artists
`GET /v1/featured artists`

Retrieves the data for all featured artists

#### Parameters
None

#### Returns
An array of all featured artist objects

---

### Retrieve featured artist
`GET /v1/featured artists/:id`

Retrieves a specific featured artist through its `id`

#### Parameters
None

#### Returns
The featured artist object with specified `id`

---

### Update featured artist
`PUT /v1/featured artists/:id`

Updates attributes of a specified featured artist object by `id`

#### Parameters
A featured artist object containing only the attributes needing change, and their updated values. For example, if you need to change the `date` attribute, you only need to include the `date` field in your request: `{"date": "some new date"}`. However, any updated attributes must follow the [attribute restrictions](#attributes).

#### Returns
The updated featured artist object

---

### Delete featured artist
`DELETE /v1/featured artists/:id`

Deles a featured artist object with `id`

#### Parameters
None

#### Returns
The featured artist object that was deleted

---

### Add images
`POST /v1/featured artists/:id/images`

Adds images to a specific featured artist by including the [image objects](#the-featured-artist-'image'-object) in your request body.

#### Parameters
Either a single image object or an array of image objects in the request body. All attributes are required for each image object.

#### Returns
The updated images array

---

### Retrieve images
`GET /v1/featured artists/:id/images`

Retrieves all the images for a specified featured artist by `id` 

#### Parameters
None

#### Returns
The images array of featured artist with specified `id`

---

### Add to description
`POST /v1/featured artists/:id/description`

Adds text to a featured artist's description by by including the text in the request body

#### Parameters
Either a single `string` or an array of `string`s in the request body

#### Returns
The updated description (array of `string`s)t

---

### Retrieve description
`GET /v1/featured artists/:id/description`

Retrieves all the text in a specific featured artist's description

#### Parameters
None

#### Returns
The description (array of `string`s)

[**Back to top**](#featured-artists-endpoint)
