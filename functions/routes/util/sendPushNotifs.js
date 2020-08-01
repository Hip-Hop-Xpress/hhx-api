// Used to send push notifs and handle errors from Expo regarding notifs
// https://github.com/expo/expo-server-sdk-node

const { getTokens } = require('./getTokens');
const { storePushTickets } = require('./storePushTickets');
const { Expo } = require('expo-server-sdk');
const { OK, SERVER_ERR } = require('../../errors/codes');

const tokensCollectionName = 'tokens';

/**
 * Sends given messages in chunks to Expo servers
 * 
 * @param {Expo} expo Expo instance from expo-server-sdk
 * @param {Array<Object>} messages array of message objects
 * @returns {Array<ExpoPushTicket>} received push tickets
 */
const sendMessageChunks = async (expo, messages) => {
  // Batch notifications so we don't send too many at once
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  // Send each chunk one at a time
  for (let chunk of chunks) {
    try {
      // FIXME: hopefully having await in for loop is ok...
      // eslint-disable-next-line no-await-in-loop
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
    } catch (e) {
      console.error(e);
    }
  }

  return tickets;
}

/**
 * Sends push notifications to Expo servers
 * 
 * @param {String} title title of notification 
 * @param {String} body body of notification
 * @param {Object} data JSON data to be included in notification
 */
const sendPushNotifs = async (title, body, data={}) => {
  let expo = new Expo();
  let messages = [];

  const pushTokens = await getTokens(tokensCollectionName);
  console.log("sendPushNotifs -> pushTokens", pushTokens)
  for (let pushToken of pushTokens) {
    // Check that each push token is valid
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`${pushToken} is not a valid push token`);
      continue;
    }

    // Create message body to send
    // https://docs.expo.io/push-notifications/sending-notifications/#message-request-format
    messages.push({
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      badge: 0,
      data: data
    });
  }

  // Send push notifications using Expo and save tickets
  try {
    const tickets = await sendMessageChunks(expo, messages);
    const formattedTickets = tickets.map((ticket, index) => {
      // Format each ticket to match schema for Firestore
      const formattedTicket = {};
      formattedTicket.status = ticket.status;
      formattedTicket.expoPushToken = pushTokens[index];  // this may not work
      if (ticket.id) formattedTicket.receiptId = ticket.id;
      if (ticket.message) formattedTicket.message = ticket.message;
      if (ticket.details) formattedTicket.details = ticket.details;
      return formattedTicket;
    });

    const responseCode = await storePushTickets(formattedTickets);
    if (responseCode !== SERVER_ERR) {
      console.log('Tickets successfully stored');
    }

  } catch (e) {
    console.error(e);
  }

}

module.exports = {
  sendPushNotifs
};
