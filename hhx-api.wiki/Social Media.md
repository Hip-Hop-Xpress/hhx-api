# Social media endpoint
The Hip Hop Xpress uses social media platforms to extend its outreach, and this API endpoint serves as a way for app clients to retrieve our social media information dynamically.

### Guide
* [The Social media object](#the-social-media-object)
  * [Attributes](#attributes)
* [Endpoints](#endpoints)
  * [Overview](#overview)
  * [Usage](#usage)

## The Social media object
```json
{
  "type": "instagram",
  "handle": "@uiuchhx",
  "url": "https://www.instagram.com/uiuchhx/"
}
```

### Attributes

These attributes are to be included in `POST` and `PUT` request bodies.

Name | Type | Restrictions | Description
-|-|-|-
`type` | `string` | must be a social media type as listed [here](https://react-native-elements.github.io/react-native-elements/docs/social_icon.html#type), cannot be updated once created | the specific social media platform, also specifies which platform to render on buttons and other components
`handle` | `string` | must be nonempty | the social media handle/username
`url` | `string` | must be a valid url | the social media URL


## Endpoints

### Overview
A quick overview of all endpoints related to our social media:

```javascript
   POST /v1/socials
    GET /v1/socials
    GET /v1/socials/types

    GET /v1/socials/:type
    PUT /v1/socials/:type
 DELETE /v1/socials/:type
```

### Usage
All use cases for the social media endpoints are listed below.

**Collection wide:**
* [Create social media: `POST /v1/socials`](#create-social-platform)
* [Retrieve all socials: `GET /v1/socials`](#retrieve-all-socials)
* [Retrieve all social media types: `GET /v1/socials/types`](#retrieve-all-types)

**Update specific:**
* [Retrieve a social platform: `GET /v1/socials/:type`](#retrieve-social-platform)
* [Update a social platform: `PUT /v1/socials/:type`](#update-social-platform)
* [Delete a social platform: `DELETE /v1/socials/:type`](#delete-social-platform)

View the [error documentation](errors) for what to expect if your request fails.

---

### Create social platform
`POST /v1/socials`

Creates an update by including a [social media object](#the-social-media-object) (JSON) in the request body - all attributes are erquired.

#### Parameters
A valid [social media object](#the-social-media-object) (JSON) with correct attributes

#### Returns
The social media object as added in the database

---

### Retrieve all socials
`GET /v1/socials`

Retrieves the data for all socials

#### Parameters
None

#### Returns
An array of all social media objects

---

### Retrieve all types
`GET /v1/socials/types`

Retrieves all social media types

#### Parameters

#### Returns
An array of `string`s containing all social media types

---

### Retrieve social platform
`GET /v1/socials/:type`

Retrieves a specific social media platform through its `type`

#### Parameters
None

#### Returns
The update object with specified `type`

---

### Update social platform
`PUT /v1/socials/:type`

Update specific attributes of an social media object with `type`

#### Parameters
An object containing only the attributes needing change, and their updated values. For example, if you need to change the `handle` attribute, you only need to include the `handle` field in your request: `{"handle": "@the_new_uiuchhx"}`. However, any updated attributes must follow the [attribute restrictions](#attributes).

#### Returns
The updated social media object

---

### Delete social platform
`DELETE /v1/socials/:type`

Deletes a specific social platform from the database by its `type`

#### Parameters
None

#### Returns
The social media object that was deleted


[**Back to top**](#social-media-endpoint)