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

// TODO: FOR DEVELOPMENT ONLY - Set to large radius to include all users
// In production, change back to smaller radius
const PROXIMITY_RADIUS = 20000000; // 20,000km in meters (basically global for dev)

// Generate a location-based chat room ID
const generateLocationChatId = (latitude, longitude) => {
  // Round to ~1km precision for grouping nearby users
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
export const sendPublicMessage = async (chatId, senderId, senderName, text) => {
  try {
    const messagesRef = collection(db, 'publicChats', chatId, 'messages');
    const chatRef = doc(db, 'publicChats', chatId);

    // Add the message
    const messageDoc = await addDoc(messagesRef, {
      senderId,
      senderName,
      text,
      timestamp: serverTimestamp(),
      createdAt: new Date(),
    });

    // Update chat with last message info
    await updateDoc(chatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
    });

    return messageDoc.id;
  } catch (error) {
    console.error('Error sending public message:', error);
    throw error;
  }
};

// Listen to messages in a public chat
export const subscribeToPublicMessages = (chatId, callback) => {
  const messagesRef = collection(db, 'publicChats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        sender: data.senderName,
        senderId: data.senderId,
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
    callback(nearbyChats);
  });
};
