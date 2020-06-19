# Hip Hop Xpress API :headphones:
The Hip Hop Xpress API will serve as a connection point between the physical lab (Double Dutch Boom Bus), the members of HHX, and clients/users of the mobile app and other HHX related applications.

# Table of Contents :control_knobs:
* [Hip Hop Xpress API](#hip-hop-xpress-api)
* [Current Progress](#current-progress)
* [Collections](#collections)
* [Usage](#usage)
  * [Endpoints](#endpoints)
    * [Historical artists](#historical-artists)
    * [Featured artists](#featured-artists)
    * [Updates](#updates)

# Current Progress :hammer:
As of now (June 2020), the Hip Hop Xpress API is under development and will be first used as a connection for use in the mobile app using [Firebase](https://firebase.google.com/).

## Collections :books:
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

Endpoint | `POST` | `GET` | `PUT` | `DELETE`
-|-|-|-|-
`/histories` | Create new data for historic artist | Retrieve all historic artists | Bulk update of all historic artists | Remove all historic artists
`/histories/{id}` | Error | Retrieve information of artist with given `id` | Update information of artist with `id` | Delete artist with `id`


### **Featured artists**
Information about artists featured by the Hip Hop Xpress

Endpoint | `POST` | `GET` | `PUT` | `DELETE`
-|-|-|-|-
`/featured` | Create data for a featured artist | Retrieve all artists featured by the Hip Hop Xpress | Bulk update of all featured artists | Remove all featured artists
`/featured/{id}` | Error | Retrieve info of featured artist with `id` | Update information of artist with `id` | Delete artist with `id`
`/featured/current` | Error | Retrieve info of currently featured artist | Update information of currently featured artist | Delete current artist


### **Updates**
Posts with updates regarding progress, projects, and news about the Hip Hop Xpress

Endpoint | `POST` | `GET` | `PUT` | `DELETE`
-|-|-|-|-
`/updates` | Create new update | Retrieve all updates | Bulk update of all update info | Remove all updates
`/updates/{date}` | Error | Retrieve update at specified date | Update information of update post at `date` | Remove update post at `date`