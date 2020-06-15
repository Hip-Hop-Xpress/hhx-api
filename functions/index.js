// Built initially using this guide:
// https://medium.com/better-programming/building-an-api-with-firebase-109041721f77

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true}));

var serviceAccount = require("./permissions.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hhx-api-48896.firebaseio.com/"
});
const db = admin.firestore();

// GET /hello-world
app.get('/hello-world', (req, res) => {
  return res.status(200).send('Hello World!');
});

/**
 * CRUD Operations
 */

// POST create
app.post('/api/create', (req, res) => {
  console.log(req.body);
  console.log(typeof req.body);
  console.log(req.body.id);
  (async () => {
      try {
        await db.collection('items').doc('/' + req.body.id + '/')
            .create({item: req.body.item});
        return res.status(200).send();
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    })();
});

// GET read item
app.get('/api/read/:item_id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('items').doc(req.params.item_id);
      let item = await document.get();
      let response = item.data();
      return res.status(200).send(response);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// GET read all
app.get('/api/read', (req, res) => {
  (async () => {
    try {
      let query = db.collection('items');
      let response = [];

      await query.get().then(querySnapshot => {
        let docs = querySnapshot.docs;
        
        // Hopefully this still works even with linting error...
        // eslint-disable-next-line promise/always-return
        for (let doc of docs) {
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

// PUT Update
app.put('/api/update/:item_id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('items').doc(req.params.item_id);
      await document.update({
        item: req.body.item
      });
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

// DELETE delete
app.delete('/api/delete/:item_id', (req, res) => {
  (async () => {
    try {
      const document = db.collection('items').doc(req.params.item_id);
      await document.delete();
      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});

exports.app = functions.https.onRequest(app);
