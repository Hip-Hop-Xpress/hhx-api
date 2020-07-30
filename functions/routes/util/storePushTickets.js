// Stores Expo push tickets into Firestore

const admin = require('firebase-admin');
const db = admin.firestore();

const collectionName = 'tickets';

/**
 * Adds formatted push tickets to Firestore
 * @param {Array<Object>} formattedPushTickets push tickets formatted 
 */
const storePushTickets = async (formattedPushTickets) => {
  try {
    for (let pushTicketDoc of formattedPushTickets) {
      // If doc doesn't have timestamp already, add it
      if (pushTicketDoc.created === undefined) {
        pushTicketDoc.created = admin.firestore.Timestamp.fromDate(new Date());
      }
  
      // Put push ticket into database
      db.collection(collectionName).add(pushTicketDoc);
    }
  } catch (e) {
    console.error('Error storing push tickets', e);
  }
}

export default storePushTickets;