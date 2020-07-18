# Projects endpoint
The Hip Hop Xpress is constantly working on projects related to STEM, music, education, community, etc. This endpoint gives access to information regarding those projects.

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
`id` | `number` | must be unique non-zero integer, cannot be updated once created | unique identifier for project
`name` | `string` | must be non-empty | name of project
`description` | `Array` of `string` | must be non-empty | describes the project
`members` | `Array` of `string` | must be non-empty | lists all members of the project
`startDate` | `string` | must be 4 characters or more | the date the project started
`endDate` | `string` or `null` | must be 4 characters or more | the date the project ended, or `null` if the project is ongoing
`icon` | `string` | must be a valid name for a [`react-native-vector-icons` icon](https://oblador.github.io/react-native-vector-icons/) | the icon displayed for the project in the app

## Endpoints

### Overview
A quick overview of all endpoints related to our projects:

```javascript
   POST /v1/projects
    GET /v1/projects

    GET /v1/projects/:id
    PUT /v1/projects/:id
 DELETE /v1/projects/:id

   POST /v1/projects/:id/description
    GET /v1/projects/:id/description

   POST /v1/projects/:id/members
    GET /v1/projects/:id/members
```

### Usage
All use cases for the projects endpoints are listed below.

**Collection wide:**
* [Create project: `POST /v1/projects`](#create-project)
* [Retrieve all projects: `GET /v1/projects`](#retrieve-all-projects)

**Project specific:**
* [Retrieve a project: `GET /v1/projects/:id`](#retrieve-project)
* [Update a project: `PUT /v1/projects/:id`](#update-project)
* [Delete a project: `DELETE /v1/projects/:id`](#delete-project)

**Project data specific:**
* [Add members for project: `POST /v1/projects/:id/members`](#add-members)
* [Retrieve members for project: `GET /v1/projects/:id/members`](#retrieve-members)
* [Add text to project description: `POST /v1/projects/:id/description`](#add-to-description)
* [Retrieve project description: `GET /v1/projects/:id/description`](#retrieve-description)

View the [error documentation](errors) for what to expect if your request fails.

---

### Create project 
`POST /v1/projects`

Creates a project by including a [project object](#the-project-object) (JSON) in the request body. All fields are required, and the `id` must be a unique, non-negative integer.

#### Parameters
A valid [project object](#the-project-object) (JSON) with correct attributes

#### Returns
The project object as added in the database

---

### Retrieve all projects
`GET /v1/projects`

Retrieves the data for all projects

#### Parameters
None

#### Returns
An array of all project objects

---

### Retrieve project
`GET /v1/projects/:id`

Retrieves a specific project through its `id`, with `:id` being the desired project's `id` field.

#### Parameters
None

#### Returns
The project object with specified `id`

---

### Update project
`PUT /v1/projects/:id`

Updates specific attributes of a project object with `id`

#### Parameters
An object containing only the attributes needing change, and their updated values. For example, if you need to change the `startDate` attribute, you only need to include the `startDate` field in your request: `{"startDate": "some new date"}`. However, any updated attributes must follow the [attribute restrictions](#attributes).

#### Returns
The updated project object

---

### Delete project
`DELETE /v1/projects/:id`

Deletes a specific project from the database by its `id`

#### Parameters
None

#### Returns
The project object that was deleted

---

### Add members
`POST /v1/projects/:id/members`

Adds members to a specific project by sending your request with the members in the request body.

#### Parameters
Either a single member (as a `string`) or an array of member (`string`) in the request body

#### Returns
The updated members array

---

### Retrieve members
`GET /v1/projects/:id/members`

Retrieves all the members for a specific project by its `id`

#### Parameters
None

#### Returns
The members array of project with specified `id`

---

### Add to description
`POST /v1/projects/:id/description`

Adds text to a project's description by including the desired text in the request body.

#### Parameters
Either a single `string` or an array of `string`s in the request body

#### Returns
The updated description (array of `string`s)

---

### Retrieve description
`GET /v1/projects/:id/description`

Retrieves all the text in a specific project's description

#### Parameters
None

#### Returns
The description (array of `string`s)

[**Back to top**](#projects-endpoint)
