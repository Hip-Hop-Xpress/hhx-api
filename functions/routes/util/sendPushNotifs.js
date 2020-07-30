// Used to send push notifs and handle errors from Expo regarding notifs
// https://github.com/expo/expo-server-sdk-node

import getTokens from './getTokens';
import { Expo } from 'expo-server-sdk';

const tokensCollectionName = 'tokens';

const sendMessageChunks = async (expo, messages) => {
  // Batch notifications so we don't send too many at once
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  (async () => {
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
  })();

  return tickets;
}

const sendPushNotifs = async (title, body, data) => {
  let expo = new Expo();
  let messages = [];

  const pushTokens = getTokens(tokensCollectionName);
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

  // Send push notifications using Expo
  try {
    await sendMessageChunks(expo, messages);
  } catch (e) {
    console.error(e);
  }

  // TODO: handle receipts from tickets
  // TODO: do we need to store all tickets/receipts in db as well?

}

export default sendPushNotifs;