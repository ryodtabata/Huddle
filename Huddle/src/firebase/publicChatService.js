import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from './configFirebase';
import { getDistance } from 'geolib';

//THIS PAGE IS MAJOR WIP

const PROXIMITY_RADIUS = 20000000; // 20,000km in meters (basically global for dev)

// Generate a location-based chat room ID
const generateLocationChatId = (latitude, longitude) => {
  //rounding to 1km
  const roundedLat = Math.round(latitude * 100) / 100;
  const roundedLng = Math.round(longitude * 100) / 100;
  return `location_${roundedLat}_${roundedLng}`;
};

// Join user to proximity-based public chat
export const joinProximityChat = async (userId, userName, userLocation) => {
  try {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      throw new Error('User location is required');
    }

    const chatId = generateLocationChatId(
      userLocation.latitude,
      userLocation.longitude
    );

    const chatRef = doc(db, 'publicChats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      // Create new proximity chat
      await setDoc(chatRef, {
        id: chatId,
        type: 'proximity',
        centerLocation: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        participants: [userId],
        participantNames: {
          [userId]: userName,
        },
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
        radius: PROXIMITY_RADIUS,
      });
    } else {
      // Add user to existing chat if not already a participant
      const chatData = chatDoc.data();
      if (!chatData.participants.includes(userId)) {
        await updateDoc(chatRef, {
          participants: [...chatData.participants, userId],
          participantNames: {
            ...chatData.participantNames,
            [userId]: userName,
          },
        });
      }
    }

    return chatId;
  } catch (error) {
    console.error('Error joining proximity chat:', error);
    throw error;
  }
};

// Get proximity chats for user's location
export const getProximityChats = async (userLocation) => {
  try {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return [];
    }

    const chatsRef = collection(db, 'publicChats');
    const q = query(chatsRef, where('type', '==', 'proximity'));

    const snapshot = await getDocs(q);
    const nearbyChats = [];

    snapshot.forEach((doc) => {
      const chatData = doc.data();
      const distance = getDistance(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        {
          latitude: chatData.centerLocation.latitude,
          longitude: chatData.centerLocation.longitude,
        }
      );

      // Include chats within 5km radius
      if (distance <= PROXIMITY_RADIUS) {
        nearbyChats.push({
          id: doc.id,
          name: `Local Chat (${Math.round(distance / 1000)}km away)`,
          distance,
          participants: chatData.participants,
          participantCount: chatData.participants.length,
          lastMessage: chatData.lastMessage,
          lastMessageTime: chatData.lastMessageTime,
          centerLocation: chatData.centerLocation,
        });
      }
    });

    // Sort by distance
    nearbyChats.sort((a, b) => a.distance - b.distance);

    return nearbyChats;
  } catch (error) {
    console.error('Error getting proximity chats:', error);
    throw error;
  }
};

// Send message to public chat
export const sendPublicMessage = async (
  chatId,
  senderId,
  senderName,
  text,
  senderProfileImage,
  userLocation = null
) => {
  try {
    console.log('Sending message to chat:', chatId);

    // First try to find the chat in groupChats collection (new system)
    let chatRef = doc(db, 'groupChats', chatId);
    let chatDoc = await getDoc(chatRef);
    let chatData = null;
    let isGroupChat = false;

    if (chatDoc.exists()) {
      chatData = chatDoc.data();
      isGroupChat = true;
      console.log('Found chat in groupChats collection');
    } else {
      // If not found, try publicChats collection (legacy system)
      chatRef = doc(db, 'publicChats', chatId);
      chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        chatData = chatDoc.data();
        console.log('Found chat in publicChats collection');
      }
    }

    // If chat doesn't exist and it's a proximity chat, try to recreate it
    if (!chatDoc.exists()) {
      console.log('Chat document does not exist:', chatId);
      console.log('User location:', userLocation);
      console.log(
        'Chat ID starts with location_:',
        chatId.startsWith('location_')
      );

      // Check if this is a proximity chat by the ID format
      if (chatId.startsWith('location_')) {
        console.log('Attempting to recreate proximity chat...');
        try {
          // Extract coordinates from chatId (format: location_lat_lng)
          const parts = chatId.split('_');
          console.log('Chat ID parts:', parts);

          if (parts.length === 3) {
            const lat = parseFloat(parts[1]);
            const lng = parseFloat(parts[2]);
            console.log('Extracted coordinates:', { lat, lng });

            // Recreate the proximity chat in publicChats collection
            chatRef = doc(db, 'publicChats', chatId);
            await setDoc(chatRef, {
              id: chatId,
              type: 'proximity',
              centerLocation: {
                latitude: lat,
                longitude: lng,
              },
              participants: [senderId],
              participantNames: {
                [senderId]: senderName,
              },
              createdAt: serverTimestamp(),
              lastMessage: null,
              lastMessageTime: null,
              radius: PROXIMITY_RADIUS,
            });
            console.log('Successfully recreated proximity chat');

            // Get the newly created document
            chatDoc = await getDoc(chatRef);
            chatData = chatDoc.data();
          } else {
            console.error('Invalid chat ID format for proximity chat:', chatId);
            throw new Error(
              'Invalid chat format. Please refresh and try again.'
            );
          }
        } catch (recreateError) {
          console.error('Failed to recreate proximity chat:', recreateError);
          throw new Error(
            'Chat no longer exists and could not be recreated. Please refresh and try again.'
          );
        }
      } else {
        console.error('Chat is not a proximity chat or missing location:', {
          chatId,
          userLocation,
        });
        throw new Error('Chat no longer exists. Please refresh and try again.');
      }
    } else {
      chatData = chatDoc.data();
    }

    // Check if user is a participant and add them if not
    let needsParticipantUpdate = false;

    if (
      chatData &&
      chatData.participants &&
      !chatData.participants.includes(senderId)
    ) {
      console.log('Adding user as participant:', senderId);
      needsParticipantUpdate = true;
    }

    // Use the correct collection for messages
    const collectionName = isGroupChat ? 'groupChats' : 'publicChats';
    const messagesRef = collection(db, collectionName, chatId, 'messages');

    // Add the message with profile image
    const messageDoc = await addDoc(messagesRef, {
      senderId,
      senderName,
      senderProfileImage,
      text,
      timestamp: serverTimestamp(),
      createdAt: new Date(),
    });

    console.log('Message added:', messageDoc.id);

    // Update chat with last message info and add user as participant if needed
    try {
      const updateData = {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
      };

      // Add user as participant if they're not already one
      if (needsParticipantUpdate && chatData) {
        updateData.participants = [...(chatData.participants || []), senderId];
        updateData.participantNames = {
          ...(chatData.participantNames || {}),
          [senderId]: senderName,
        };
        console.log('Adding user to participants list');
      }

      await updateDoc(chatRef, updateData);
      console.log('Chat updated with last message and participant info');
    } catch (updateError) {
      console.warn(
        'Failed to update chat document, but message was sent:',
        updateError
      );
      // Don't throw here - the message was still sent successfully
    }

    return messageDoc.id;
  } catch (error) {
    console.error('Error sending public message:', error);
    throw error;
  }
};

//Listen to messages in a public chat, this is going to cause a looooooooot of api calls when we start to sclae up, so will need to optimize later
export const subscribeToPublicMessages = (chatId, callback) => {
  let unsubscribeFunction = null;

  // Function to create the subscription once we know the collection
  const createSubscription = (collectionName) => {
    console.log(`Subscribing to messages in ${collectionName} collection`);
    const messagesRef = collection(db, collectionName, chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          sender: data.senderName,
          senderId: data.senderId,
          senderProfileImage: data.senderProfileImage,
          text: data.text,
          time: data.createdAt
            ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
          timestamp: data.timestamp,
        });
      });
      callback(messages);
    });
  };

  // First check groupChats collection
  const groupChatRef = doc(db, 'groupChats', chatId);
  getDoc(groupChatRef)
    .then((chatDoc) => {
      if (chatDoc.exists()) {
        unsubscribeFunction = createSubscription('groupChats');
      } else {
        // Check publicChats collection
        const publicChatRef = doc(db, 'publicChats', chatId);
        getDoc(publicChatRef)
          .then((publicChatDoc) => {
            if (publicChatDoc.exists()) {
              unsubscribeFunction = createSubscription('publicChats');
            } else {
              console.log(
                'Chat not found in either collection, defaulting to publicChats'
              );
              unsubscribeFunction = createSubscription('publicChats');
            }
          })
          .catch((error) => {
            console.error('Error checking publicChats:', error);
            unsubscribeFunction = createSubscription('publicChats');
          });
      }
    })
    .catch((error) => {
      console.error('Error checking groupChats:', error);
      unsubscribeFunction = createSubscription('publicChats');
    });

  // Return a function that will unsubscribe when called
  return () => {
    if (unsubscribeFunction && typeof unsubscribeFunction === 'function') {
      unsubscribeFunction();
    }
  };
};

// Subscribe to user's proximity chats
export const subscribeToProximityChats = (userLocation, callback) => {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    callback([]);
    return () => {};
  }

  const chatsRef = collection(db, 'publicChats');
  const q = query(chatsRef, where('type', '==', 'proximity'));

  return onSnapshot(q, (snapshot) => {
    const nearbyChats = [];
    snapshot.forEach((doc) => {
      const chatData = doc.data();
      const distance = getDistance(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        {
          latitude: chatData.centerLocation.latitude,
          longitude: chatData.centerLocation.longitude,
        }
      );
      if (distance <= PROXIMITY_RADIUS) {
        nearbyChats.push({
          id: doc.id,
          name: `Local Chat (${Math.round(distance / 1000)}km away)`,
          distance,
          participants: chatData.participants,
          participantCount: chatData.participants.length,
          lastMessage: chatData.lastMessage,
          lastMessageTime: chatData.lastMessageTime,
          centerLocation: chatData.centerLocation,
        });
      }
    });

    // Sort by distance
    nearbyChats.sort((a, b) => a.distance - b.distance);
    callback(nearbyChats);
  });
};
