# Hip Hop Xpress API Proposal
Listed below are the planned endpoints for `v1` of the API. Checked endpoints will link to the Wiki documentation.
- [ ] [Historical artists](#historical-artists)
- [x] [Variations](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Variations)
- [ ] [Courses](#courses)
- [x] [Projects](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Projects)
- [ ] [Featured artists](#featured-artists)
- [x] [Updates](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Updates)
- [x] [Location](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Location)
- [ ] [Social Media](#social-media)

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
This info has been updated and moved to the [wiki](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Variations).

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
This info has been updated and moved to the [wiki](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Projects).

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
This info has been updated and moved to the [wiki](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Updates).

### **Location**
This info has been updated and moved to the [wiki](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Location).

### **Social Media**
List of all social media platforms associated with the Hip Hop Xpress

<details>
  <summary>Social media endpoint details</summary>

  Endpoint | `POST` | `GET` | `PUT` | `DELETE`
  -|-|-|-|-
  `/socials` | Create new social media info | Retrieve all social media info | Bulk update of all social media info | Remove all social media info
  `/socials/:type` | Error | Retrieve social media info of `type` (ex. `"instagram"`) | Update social media info of `type` | Remove social media info of `type`
</details>