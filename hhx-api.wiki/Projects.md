# Projects endpoint
The Hip Hop Xpress is constantly working on projects related to STEM, music, education, community, and so on. This endpoint gives access to information regarding those projects.

### Guide
* [The Project object](#the-project-object)
  * [Attributes](#attributes)
* [Endpoints](#endpoints)
  * [Overview](#overview)
  * [Usage](#usage)

## The Project object
Each project object holds data in JSON format. **All attributes are required in POST requests, but not in PUT requests.**
Below is an example Project object:

```json
{
  "id": 4,
  "name": "Human Seatbox",
  "description": [
    "The Human Seatbox is a digitized bus seat that produces drum sounds when..."
  ],
  "members": [
    "Irene A.",
    "Berklee A.",
    "Joe"
  ],
  "startDate": "February 2020",
  "endDate": "May 2020",
  "icon": "chair-school"
}
```

### Attributes

Name | Type | Restrictions | Description
-|-|-|-
`id` | `number` | must be unique non-zero integer | unique identifier for project
`name` | `string` | must be non-empty | name of project
`description` | `Array` of `string` | must be non-empty | describes the project
`members` | `Array` of `string` | must be non-empty | lists all members of the project
`startDate` | `string` | must be 4 characters or more | the date the project started
`endDate` | `string` or `null` | must be 4 characters or more | the date the project ended, or `null` if the project is ongoing
`icon` | `string` | must be a valid name for a [`react-native-vector-icons` icon](https://oblador.github.io/react-native-vector-icons/) | the icon displayed for the project in the app

## Endpoints

### Overview

### Usage

---
