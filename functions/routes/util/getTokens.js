// Used to get all Expo push tokens in Firestore collection

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Grabs all Expo push tokens in Firestore collection
 * @param {String} collectionName name of tokens collection
 * @return {Array<String>} array of Expo push tokens, as strings 
 */
const getTokens = async (collectionName) => {
  // Query the collection and setup response
  let query = db.collection(collectionName);
  let expoPushTokens = [];

  // Get all documents from collection
  await query.get().then(snapshot => {
    let docs = snapshot.docs;

    for (let pushTokenDoc of docs) {

      const expoPushToken = pushTokenDoc.data().pushToken;
      // Put the response doc into the response list
      expoPushTokens.push(expoPushToken);
    }

    return expoPushTokens;
  });
}

export default getTokens;