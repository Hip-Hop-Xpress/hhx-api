# Hip Hop Xpress API Proposal
Listed below are the planned endpoints for `v1` of the API. Checked endpoints will link to the Wiki documentation.
- [ ] [Historical artists](#historical-artists)
- [x] [Variations](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Variations)
- [x] [Courses](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Courses)
- [x] [Projects](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Projects)
- [ ] [Featured artists](#featured-artists)
- [x] [Updates](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Updates)
- [x] [Location](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Location)
- [x] [Social Media](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Social-Media)

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
This info has been updated and moved to the [wiki](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Courses).

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
This info has been updated and moved to the [wiki](https://github.com/Hip-Hop-Xpress/hhx-api/wiki/Social-Media).