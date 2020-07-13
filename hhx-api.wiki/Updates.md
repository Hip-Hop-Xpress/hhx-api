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
  "date": "May 2020",
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
`date` | `string` | must be 4 characters or more | the date the update is released
`author` | `string` | must be non-empty | the author of the update
`body` | `Array` of `string` | must be non-empty | body text of the update

## Endpoints

### Overview

### Usage

[**Back to top**](#updates-endpoint)