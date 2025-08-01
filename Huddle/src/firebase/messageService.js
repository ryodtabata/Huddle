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
  arrayUnion,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from './configFirebase';
import { areUsersFriends } from './friendsService';

//not sure if this works yet, no it does not....

// Create or get a conversation between two users (only if they are friends)
export const createConversation = async (
  user1Id,
  user2Id,
  user1Name,
  user2Name
) => {
  try {
    //Check if users are friends before creating conversation
    const areFriends = await areUsersFriends(user1Id, user2Id);
    if (!areFriends) {
      throw new Error('You can only message people in your friends list');
    }

    // Create a consistent conversation ID by sorting user IDs
    const conversationId = [user1Id, user2Id].sort().join('_');

    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      // Create new conversation
      await setDoc(conversationRef, {
        participants: [user1Id, user2Id],
        participantNames: {
          [user1Id]: user1Name,
          [user2Id]: user2Name,
        },
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
      });
    }

    return conversationId;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Send a message in a conversation
export const sendMessage = async (
  conversationId,
  senderId,
  senderName,
  text
) => {
  try {
    const messagesRef = collection(
      db,
      'conversations',
      conversationId,
      'messages'
    );
    const conversationRef = doc(db, 'conversations', conversationId);

    // Add the message
    const messageDoc = await addDoc(messagesRef, {
      senderId,
      senderName,
      text,
      timestamp: serverTimestamp(),
      createdAt: new Date(),
    });

    // Update conversation with last message info
    await updateDoc(conversationRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
    });

    return messageDoc.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Listen to messages in a conversation
export const subscribeToMessages = (conversationId, callback) => {
  const messagesRef = collection(
    db,
    'conversations',
    conversationId,
    'messages'
  );
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

// Get user's conversations
export const getUserConversations = async (userId) => {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const snapshot = await getDocs(q);
    const conversations = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const otherParticipantId = data.participants.find((id) => id !== userId);
      const otherParticipantName = data.participantNames[otherParticipantId];

      conversations.push({
        id: doc.id,
        name: otherParticipantName,
        otherUserId: otherParticipantId,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime,
      });
    });

    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

// Listen to user's conversations
export const subscribeToConversations = (userId, callback) => {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const otherParticipantId = data.participants.find((id) => id !== userId);
      const otherParticipantName = data.participantNames[otherParticipantId];

      conversations.push({
        id: doc.id,
        name: otherParticipantName,
        otherUserId: otherParticipantId,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime,
      });
    });
    callback(conversations);
  });
};
