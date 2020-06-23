// Variations routes will go here

const routes = require('express').Router();
const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Variations endpoints
 *  /variations
 *  /variations/:id
 *  /variations/:id/images
 */

/*
 Schema:

 {
    id: 0
    name: 'Airstream Trailer',
    date: '2010',
    description: [
      'In October 2009, a Champaign, Illinois, police officer shot and killed an unarmed fifteen-year-old African American boy (Kiwane Carrington). Over the previous two years, the city had been struggling with race relations, civic leadership, and social responsibility throughout the community, particularly with African American youth.',
      'Our initial plan proposed in 2010 as the IPOWERED Airstream Mobile Media Archive required rethinking in order to attract and engage young people in urban communities. Hence, the focus changed and the project was renamed N Search of Hip Hop Xpress. The purpose of the Xpress was to support efforts to build and rebuild community in spaces where civic and social groups such as neighborhood associations were hosting community-building activities.',
      'With music audible from speakers outside of the trailer, people would come together to visit and learn new skills, such as digital storytelling, mash-ups, dj’ing, and spoken word performance. Young people would pull their adults over to the trailer to show them the interior, which was outfitted with computers, recording equipment, digital turntables, microphones, headsets, video games, and mixers.',
      'The Xpress was initially funded by the Office of the Vice Chancellor for Public Engagement ($17,000), with the design of the skin by John Jennings. It made multiple stops during its run, which included:',
      '- Jetti Rhodes Day\n- Environment Day at the Don Moyer Boys and Girls Club\n- Old School Sundays in Douglass Park (12 appearances)\n- First String Negro League Celebration\n- Champaign-Urbana Days in Douglass Park\n- Beardsley Park Community Celebration\n- East St. Louis Joseph Homeless Veterans Center\n- City of Champaing Beardsley Street Neighborhood Fest (a new neighborhood association was launched due to this event)\n- Dobbins Downs Park Dedication Celebration',
      'In partnerships with the Don Moyer Boys and Girls Club, the Community Informatics Initiative (of the Graduate School of Library and Information Science, now the School of Information Sciences), Champaign County Historical Archives, Champaign Park District, and the Office of Inclusion and Intercultural Relations, Hip Hop Xpress engaged with several thousand residents in 2009-10, locally and state wide. The Xpress recirculated historical documents such as old newspapers and photos to community residents at various events; introduced iPads to Joseph Center veterans; and demonstrated audio and video technology to members of the Don Moyer Boys & Girls Club.',
      'That year, the City of Champaign and the Don Moyer Boys & Girls Club requested Hip Hop Xpress Productions to facilitate a community dialogue between Champaign police and largely African American youth in north Champaign. The event produced a working document for the City of Champaign and the Club to use to structure youth development initiatives in north Champaign. Staffing and budget limited the use of the Xpress; we were unable to respond to requests to appear at nine events. The Airstream trailer was only available for six months before being repurposed permanently.',
    ],
    images: [
      {
        url: 'https://publish.illinois.edu/hiphopxpress/files/2018/09/HipHopExpressTrailer_small.jpeg',
        caption: '',
        componentImage: true,
      },
      {
        url: 'http://publish.illinois.edu/hiphopxpress/files/2018/09/100_2066-1-300x225.jpg',
        caption: '',
        componentImage: false,
      },
      {
        url: 'http://publish.illinois.edu/hiphopxpress/files/2018/09/100_2064-1-150x150.jpg',
        caption: '',
        componentImage: false,
      },
      {
        url: 'http://publish.illinois.edu/hiphopxpress/files/2018/09/100_2063-1-150x150.jpg',
        caption: 'Inside the Airstream',
        componentImage: false,
      }
    ]
  }
 */

/**
 * POST /variations
 */
routes.post('/', (req, res) => {
  console.log('Request info:');
  console.log(typeof req.body);
  console.log(req.body);
  (async () => {
    try {
      await db.collection('variations').doc(`/${req.body.id}/`)
        .create({
          name: req.body.name,
          date: req.body.date,
          description: req.body.description,
          images: req.body.images,
        });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();

});

/**
 * GET /variations
 */
routes.get('/', (req, res) => {
  (async () => {
    try {
      let query = db.collection('variations');
      let response = [];

      await query.get().then(querySnapshot => {
        let docs = querySnapshot.docs;

        // eslint-disable-next-line promise/always-return
        for (let variation of docs) {
          const selectedItem = {
            id: variation.id,
            name: variation.data().name,
            date: variation.data().date,
            description: variation.data().description,
            images: variation.data().images,
          };

          response.push(selectedItem);
        }
      });

      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();

});

/**
 * PUT /variations
 */
routes.put('/', (req, res) => {

});

/**
 * DELETE /variations
 */
routes.delete('/', (req, res) => {

});

/**
 * GET /variations/:id
 */
routes.get('/:id', (req, res) => {

})

/**
 * PUT /variations/:id
 */
routes.put('/:id', (req, res) => {

})

/**
 * DELETE /variations/:id
 */
routes.delete('/:id', (req, res) => {

})

module.exports = routes;
