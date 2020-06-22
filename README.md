# Hip Hop Xpress API :headphones:
The Hip Hop Xpress API will serve as a connection point between the physical lab (Double Dutch Boom Bus), the members of HHX, and clients/users of the mobile app and other HHX related applications.

# Table of Contents :control_knobs:
*This section is a work in progress.* :pick:
* [Hip Hop Xpress API](#hip-hop-xpress-api-headphones)
* [Current Progress](#current-progress-hammer)
* [Collections](#collections-books)
* [Usage](#usage-blue_book)
  * [Endpoints](#endpoints-electric_plug)
    * [Historical artists](#historical-artists)
    * [Variations](#variations)
    * [Courses](#courses)
    * [Projects](#projects)
    * [Featured artists](#featured-artists)
    * [Updates](#updates)
    * [Location](#location)
    * [Social Media](#social-media)

# Current Progress :hammer:
As of now (June 2020), the Hip Hop Xpress API is under development and will be first used as a connection for use in the mobile app using [Firebase](https://firebase.google.com/).

## Collections :books:
*This section is a work in progress.* :pick:

These are the collections currently under development for use in the mobile app:
* Information and histories about artists on the physical lab
* Information on the past courses held by the Hip Hop Xpress
* Artists featured by the Hip Hop Xpress on the mobile app and social media
* Geographic location of the physical lab
* Leaders and participants of the Hip Hop Xpress
* Projects under and/or aligned with the Hip Hop Xpress
* Social media information for the Hip Hop Xpress
* Update and post information regarding the Hip Hop Xpress and its progress
* History of the different iterations of the Hip Hop Xpress (known as "variations")

# Usage :blue_book:

## Endpoints :electric_plug:
*This section is a work in progress.* :pick:

The following endpoints are currently being planned and developed.

### **Historical artists**
Information and histories about artists on the physical lab

<details>
  <summary>Historical artist endpoint details</summary>

  Endpoint | `POST` | `GET` | `PUT` | `DELETE`
  -|-|-|-|-
  `/histories` | Create new data for historic artist | Retrieve all historic artists | Bulk update of all historic artists | Remove all historic artists
  `/histories/:id` | Error | Retrieve information of artist with given `id` | Update information of artist with `id` | Delete artist with `id`

</details>

### **Variations**
Information on past iterations/'variations' of the Hip Hop Xpress
<details>
  <summary>Variations endpoint details</summary>

  Endpoint | `POST` | `GET` | `PUT` | `DELETE`
  -|-|-|-|-
  `/variations` | Create new data for variation | Retrieve data for all variations | Bulk update of all variations | Remove all variations
  `/variations/:id` | Error | Retrieve data for variation `id` | Update info for variation `id` | Remove variation `id`
  `/variations/:id/images` | Add new images for variation `id` | Retrieve all images from variation `id` | Update all images for variation `id` | Remove images for variation `id`

</details>

### Courses
Information on past courses held by the Hip Hop Xpress
<details>
  <summary>Courses endpoint details</summary>

  Endpoint | `POST` | `GET` | `PUT` | `DELETE`
  -|-|-|-|-
  `/courses` | Create data for course | Retrieve all courses | Bulk update of all courses | Remove all data for courses
  `/courses/:id` | Error | Retrieve info of course with `id` | Update info of course with `id` | Delete course with `id`
</details>

### **Projects**
Information on the current, ongoing projects by or under the Hip Hop Xpress

<details>
  <summary>Projects endpoint details</summary>

  Endpoint | `POST` | `GET` | `PUT` | `DELETE`
  -|-|-|-|-
  `/projects` | Create data for project | Retrieve info for all projects | Bulk update of all projects | Remove all info for projects
  `/projects/:id` | Error | Retrieve info of project with `id` | Update info of project with `id` | Delete project with `id`

</details>

### **Featured artists**
Information about artists featured by the Hip Hop Xpress

<details>
  <summary>Featured artist endpoint details</summary>
  
  Endpoint | `POST` | `GET` | `PUT` | `DELETE`
  -|-|-|-|-
  `/featured` | Create data for a featured artist | Retrieve all artists featured by the Hip Hop Xpress | Bulk update of all featured artists | Remove all featured artists
  `/featured/:id` | Error | Retrieve info of featured artist with `id` | Update information of artist with `id` | Delete artist with `id`
  `/featured/current` | Error | Retrieve info of currently featured artist | Update information of currently featured artist | Delete current artist

</details>


### **Updates**
Posts with updates regarding progress, projects, and news about the Hip Hop Xpress

<details>
  <summary>Update posts endpoint details</summary>
  
  Endpoint | `POST` | `GET` | `PUT` | `DELETE`
  -|-|-|-|-
  `/updates` | Create new update | Retrieve all updates | Bulk update of all update info | Remove all updates
  `/updates/:date` | Error | Retrieve update at specified date | Update information of update post at `date` | Remove update post at `date`

</details>

### **Location**
Current location of the Double Dutch Boom Bus or other Hip Hop Xpress devices.

<details>
  <summary>Location endpoint details</summary>

  Endpoint | `POST` | `GET` | `PUT` | `DELETE`
  -|-|-|-|-
  `/location` | Write new location for the lab | Get location of lab | Update location information about lab | Delete location info

</details>

### **Social Media**
List of all social media platforms associated with the Hip Hop Xpress

<details>
  <summary>Social media endpoint details</summary>

  Endpoint | `POST` | `GET` | `PUT` | `DELETE`
  -|-|-|-|-
  `/socials` | Create new social media info | Retrieve all social media info | Bulk update of all social media info | Remove all social media info
  `/socials/:type` | Error | Retrieve social media info of `type` (ex. `"instagram"`) | Update social media info of `type` | Remove social media info of `type`
</details>