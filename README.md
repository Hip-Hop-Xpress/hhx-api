# Hip Hop Xpress API

## Description
The Hip Hop Xpress API will serve as a connection point between the physical lab (Double Dutch Boom Bus), the members of HHX, and clients/users of the mobile app and other HHX related applications.

## Current Progress
As of now (June 2020), the Hip Hop Xpress API is under development and will be first used as a connection for use in the mobile app using [Firebase](https://firebase.google.com/).

### Collections
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

## Usage

### Endpoints (*WIP*)
The following endpoints are currently being planned and developed.

#### Information and histories about artists on the physical lab
Resource | POST | GET | PUT | DELETE
---------|------|-----|-----|-------
`/histories` | Create new data for historic artist | Retrieve all historic artists | Bulk update of all historic artists | Remove all historic artists
`/histories/{id}` | Error | Retrieve information of artist with given `id` | Update information of artist with `id` | Delete artist with `id`

#### Information about artists featured by the Hip Hop Xpress
Resource | POST | GET | PUT | DELETE
---------|------|-----|-----|-------
`/featured` | Create data for a featured artist | Retrieve all artists featured by the Hip Hop Xpress | Bulk update of all featured artists | Remove all featured artists
`/featured/{id}` | Error | Retrieve info of featured artist with `id` | Update information of artist with `id` | Delete artist with `id`
`/featured/current` | Error | Retrieve info of currently featured artist | Update information of currently featured artist | Delete current artist
