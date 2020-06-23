// Variations routes will go here

const routes = require('express').Router();
const admin = require('firebase-admin');

// may have to set up database authentication

const db = admin.firestore();

/**
 * Variations endpoint
 * /variations
 * /variations/:id
 * /variations/:id/images
 */

/**
 * POST /variations
 */
routes.post('/', (req, res) => {

});

/**
 * GET /variations
 */
routes.get('/', (req, res) => {
  console.log('start GET /variations');
  (async () => {
    try {
      let query = db.collection('variations');
      console.log("query", query)
      let response = [];

      await query.get().then(querySnapshot => {
        let docs = querySnapshot.docs;
        console.log("docs", docs)

        // eslint-disable-next-line promise/always-return
        for (let doc of docs) {
          console.log("doc", doc)
          const selectedItem = {
            id: doc.id,
            item: doc.data().item
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
