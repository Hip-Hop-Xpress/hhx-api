# Historic artists endpoint
Throughout history, several great artists have paved the way for hip hop in the music industry and into our very lives. These artists are honored through artwork on the Double Dutch Boom Bus, and this endpoint serves to provide information about these incredible, timeless artists and musicians.

### Guide
* [The Historic artist object](#the-historic-artist-object)
  * [Attributes](#attributes)
* [The Historic artist 'Image' object](#the-image-object)
* [Endpoints](#endpoints)
  * [Overview](#overview)
  * [Usage](#usage)

## The Historic artist object
Each historic artist object holds data in JSON format. **All attributes are required in POST requests, but not in PUT requests** (see more [here](#create-historic-artist)).
```json
{
  "id": 0,
  "name": "Michael Jackson",
  "born": "August 29, 1958",
  "died": "June 25, 2009",
  "description": [
    "Michael Jackson’s career started from his family music group, the Jackson 5, which..."
  ],
  "images": [
    {
      "url": "https://www.publish.illinois.edu/.../MichaelJacksonProfile.jpg",
      "caption": "Jackson performing"
    }
  ],
}
```
### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`id` | `number` | must be unique non-zero integer, cannot be updated once created | unique identifier for historic artist
`name` | `string` | must be non-empty | display name for historic artist
`born` | `string` | must be 4 characters or more | describes the date the artist was born
`died` | `string` or `null` | must be 4 characters or more | describes the date the artist died, or `null` if the artist is still alive
`description` | `Array` of `string` | must be non-empty | describes the historic artist
`images` | `Array` of image `Object`s | can be empty, contents must follow the [image schema](#the-image-object) | all images to be displayed for this artist

## The Image object
Image object schema for `images` array in the historic artist object. Each field is required when [creating new images.](#add-images)
```json
{
  "url": "https://www.publish.illinois.edu/.../BudLaserProfile.jpg",
  "caption": "Bud Laser in the Studio"
}
```

### Attributes
Name | Type | Restrictions | Description
-|-|-|-
`url` | `string` | must be a valid URL | points to image of historic artist
`caption` | `string` | none, can be empty | briefly describes the image

## Endpoints

### Overview
A quick overview of all endpoints related to Historic artists on the Hip Hop Xpress
```javascript
   POST /v1/historic
    GET /v1/historic

    GET /v1/historic/:id
    PUT /v1/historic/:id
 DELETE /v1/historic/:id

   POST /v1/historic/:id/bio
    GET /v1/historic/:id/bio

   POST /v1/historic/:id/images
    GET /v1/historic/:id/images

```

### Usage
All use cases for the Historic artists endpoints are listed below.

**Collection wide:**
* [Create historic artist: `POST /v1/historic`](#create-historic-artist)
* [Retrieve all historic artists: `GET /v1/historic`](#retrieve-all-historic-artists)

**Historic artist specific:**
* [Retrieve a historic artist: `GET /v1/historic/:id`](#retrieve-historic-artist)
* [Update a historic artist: `PUT /v1/historic/:id`](#update-historic-artist)
* [Delete a historic artist: `DELETE /v1/historic/:id`](#delete-historic-artist)

**Historic artist data specific:**
* [Add text to historic artist bio: `POST /v1/historic/:id/bio`](#add-to-bio)
* [Retrieve historic artist's bio: `GET /v1/historic/:id/bio`](#retrieve-bio)
* [Add images for historic artist: `POST /v1/historic/:id/images`](#add-images)
* [Retrieve images for historic artist: `GET /v1/historic/:id/images`](#retrieve-images)


View the [error documentation](errors) for what to expect if your request fails.

---

### Create historic artist 
`POST /v1/historic`

Creates a historic artist by including a [historic artist object](#the-historic-artist-object) (JSON) in the request body. All fields are required, and the `id` must be a unique, non-negative integer.

#### Parameters
A valid [historic artist object](#the-historic-artist-object) (JSON) with correct attributes

#### Returns
The historic artist object as added in the database if successful

---

### Retrieve all historic artists
`GET /v1/historic`

Retrieves the data for all historic artists

#### Parameters
None

#### Returns
An array of all historic artist objects

---

### Retrieve historic artist
`GET /v1/historic/:id`

Retrieves a specific historic artist through its `id`

#### Parameters
None

#### Returns
The historic artist object with specified `id`

---

### Update historic artist
`PUT /v1/historic/:id`

Updates attributes of a specified historic artist object by `id`

#### Parameters
A historic artist object containing only the attributes needing change, and their updated values. For example, if you need to change the `date` attribute, you only need to include the `date` field in your request: `{"date": "some new date"}`. However, any updated attributes must follow the [attribute restrictions](#attributes).

#### Returns
The updated historic artist object

---

### Delete historic artist
`DELETE /v1/historic/:id`

Deles a historic artist object with `id`

#### Parameters
None

#### Returns
The historic artist object that was deleted

---

### Add images
`POST /v1/historic/:id/images`

Adds images to a specific historic artist by including the [image objects](#the-image-object) in your request body.

#### Parameters
Either a single image object or an array of image objects in the request body. All attributes are required for each image object.

#### Returns
The updated images array

---

### Retrieve images
`GET /v1/historic/:id/images`

Retrieves all the images for a specified historic artist by `id` 

#### Parameters
None

#### Returns
The images array of historic artist with specified `id`

---

### Add to bio
`POST /v1/historic/:id/bio`

Adds text to a historic artist's bio by by including the text in the request body

#### Parameters
Either a single `string` or an array of `string`s in the request body

#### Returns
The updated bio (array of `string`s)t

---

### Retrieve bio
`GET /v1/historic/:id/bio`

Retrieves all the text in a specific historic artist's bio

#### Parameters
None

#### Returns
The description (array of `string`s)

### Create social platform
`POST /v1/historic/:id/socials`

Creates an social media object for the artist by including a [social media object](#the-social-media-object) (JSON) in the request body - all attributes are required.

#### Parameters
A valid [social media object](#the-social-media-object) (JSON) with correct attributes

#### Returns
The social media object as added in the database

---

### Retrieve all socials
`GET /v1/historic/:id/socials`

Retrieves the data for all of the historic artist's socials

#### Parameters
None

#### Returns
An array of all social media objects

[**Back to top**](#historic-artists-endpoint)
