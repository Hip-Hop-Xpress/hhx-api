# Courses endpoint
Collaborators and members of the Hip Hop Xpress have been teaching Hip-Hop inspired courses in formal and informal setting for years. This endpoint serves to provide basic information about these courses.

### Guide
* [The Course object](#the-course-object)
  * [Attributes](#attributes)
* [Endpoints](#endpoints)
  * [Overview](#overview)
  * [Usage](#usage)

## The Course object
Each course object holds data in JSON format. **All attributes are required in POST requests, but not in PUT requests.**
Below is an example Course object:

```json
{
  "id": 0,
  "name": "Ghetto Genius Motorsports at the Don Moyer Boys & Girls Club",
  "description": [
    "Ghetto Genius (GG), a culture and engineering start-up, used the..."
  ],
  "startDate": "Fall 2016",
  "endDate": "Fall 2016",
}
```

### Attributes

Name | Type | Restrictions | Description
-|-|-|-
`id` | `number` | must be unique non-zero integer | unique identifier for course
`name` | `string` | must be non-empty | name of course
`description` | `Array` of `string` | must be non-empty | short description/summary of the course
`startDate` | `string` | must be 4 characters or more | the date the course started
`endDate` | `string` or `null` | must be 4 characters or more | the date the course ended, or `null` if the course is ongoing

## Endpoints

### Overview
A quick overview of all endpoints related to our courses:

```javascript
   POST /v1/courses
    GET /v1/courses

    GET /v1/courses/:id
    PUT /v1/courses/:id
 DELETE /v1/courses/:id

   POST /v1/courses/:id/description
    GET /v1/courses/:id/description
```

### Usage
All use cases for the courses endpoints are listed below.

**Collection wide:**
* [Create course: `POST /v1/courses`](#create-course)
* [Retrieve all courses: `GET /v1/courses`](#retrieve-all-courses)

**Course specific:**
* [Retrieve a course: `GET /v1/courses/:id`](#retrieve-course)
* [Update a course: `PUT /v1/courses/:id`](#update-course)
* [Delete a course: `DELETE /v1/courses/:id`](#delete-course)

**Course data specific:**
* [Add text to course description: `POST /v1/courses/:id/description`](#add-to-description)
* [Retrieve course description: `GET /v1/courses/:id/description`](#retrieve-description)

View the [error documentation](errors) for what to expect if your request fails.

---

### Create course 
`POST /v1/courses`

Creates a course by including a [course object](#the-course-object) (JSON) in the request body. All fields are required, and the `id` must be a unique, non-negative integer.

#### Parameters
A valid [course object](#the-course-object) (JSON) with correct attributes

#### Returns
The course object as added in the database

---

### Retrieve all courses
`GET /v1/courses`

Retrieves the data for all courses

#### Parameters
None

#### Returns
An array of all course objects

---

### Retrieve course
`GET /v1/courses/:id`

Retrieves a specific course through its `id`, with `:id` being the desired course's `id` field.

#### Parameters
None

#### Returns
The course object with specified `id`

---

### Update course
`PUT /v1/courses/:id`

Updates specific attributes of a course object with `id`

#### Parameters
An object containing only the attributes needing change, and their updated values. For example, if you need to change the `startDate` attribute, you only need to include the `startDate` field in your request: `{"startDate": "some new date"}`. However, any updated attributes must follow the [attribute restrictions](#attributes).

#### Returns
The updated course object

---

### Delete course
`DELETE /v1/courses/:id`

Deletes a specific course from the database by its `id`

#### Parameters
None

#### Returns
The course object that was deleted

---

### Add members
`POST /v1/courses/:id/members`

Adds members to a specific course by sending your request with the members in the request body.

#### Parameters
Either a single member (as a `string`) or an array of member (`string`) in the request body

#### Returns
The updated members array

---

### Retrieve members
`GET /v1/courses/:id/members`

Retrieves all the members for a specific course by its `id`

#### Parameters
None

#### Returns
The members array of course with specified `id`

---

### Add to description
`POST /v1/courses/:id/description`

Adds text to a course's description by including the desired text in the request body.

#### Parameters
Either a single `string` or an array of `string`s in the request body

#### Returns
The updated description (array of `string`s)

---

### Retrieve description
`GET /v1/courses/:id/description`

Retrieves all the text in a specific course's description

#### Parameters
None

#### Returns
The description (array of `string`s)

[**Back to top**](#courses-endpoint)
