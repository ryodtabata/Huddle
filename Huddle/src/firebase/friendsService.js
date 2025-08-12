import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './configFirebase';

// Check if friend request already exists
export const checkExistingFriendRequest = async (fromUserId, toUserId) => {
  try {
    const requestsRef = collection(db, 'friendRequests');

    // Check if there's already a pending request between these users (either direction)
    const q1 = query(
      requestsRef,
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('status', '==', 'pending')
    );

    const q2 = query(
      requestsRef,
      where('fromUserId', '==', toUserId),
      where('toUserId', '==', fromUserId),
      where('status', '==', 'pending')
    );

    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    return !snapshot1.empty || !snapshot2.empty;
  } catch (error) {
    console.error('Error checking existing friend request:', error);
    return false;
  }
};

// Send friend request
export const sendFriendRequest = async (
  fromUserId,
  toUserId,
  fromUserName,
  toUserName
) => {
  try {
    console.log('Sending friend request from:', fromUserId, 'to:', toUserId);

    // Check if users are already friends
    const alreadyFriends = await areUsersFriends(fromUserId, toUserId);
    if (alreadyFriends) {
      throw new Error('You are already friends with this user');
    }

    // Check if request already exists
    const requestExists = await checkExistingFriendRequest(
      fromUserId,
      toUserId
    );
    if (requestExists) {
      throw new Error('Friend request already exists between these users');
    }

    const requestRef = collection(db, 'friendRequests');
    const docRef = await addDoc(requestRef, {
      fromUserId,
      toUserId,
      fromUserName,
      toUserName,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    console.log('Friend request created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// Accept friend request
export const acceptFriendRequest = async (requestId, fromUserId, toUserId) => {
  try {
    // Update request status
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
    });

    // Add to both users' friends lists
    const user1Ref = doc(db, 'users', fromUserId);
    const user2Ref = doc(db, 'users', toUserId);

    await updateDoc(user1Ref, {
      friends: arrayUnion(toUserId),
    });

    await updateDoc(user2Ref, {
      friends: arrayUnion(fromUserId),
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

// Get user's friends list
export const getUserFriends = async (userId) => {
  try {
    console.log('Getting friends for user:', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const friendIds = userData.friends || [];
      console.log('Friend IDs found:', friendIds);

      // Get friend profiles
      const friends = [];
      for (const friendId of friendIds) {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        if (friendDoc.exists()) {
          const friendData = friendDoc.data();
          friends.push({
            id: friendData.uid || friendId, // Use uid from data or fallback to friendId
            uid: friendData.uid || friendId,
            name: friendData.displayName || friendData.email || 'Unknown User',
            displayName: friendData.displayName,
            email: friendData.email,
            profileImage: friendData.profileImage,
            bio: friendData.bio || '',
            age: friendData.age || 0,
            verified: friendData.verified || false,
          });
        } else {
          console.warn('Friend document not found for ID:', friendId);
        }
      }

      console.log('Mapped friends data:', friends);
      return friends;
    }
    return [];
  } catch (error) {
    console.error('Error getting user friends:', error);
    throw error;
  }
};

// Check if users are friends
export const areUsersFriends = async (userId1, userId2) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId1));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const friends = userData.friends || [];
      return friends.includes(userId2);
    }
    return false;
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
};

// Get pending friend requests for user
export const getPendingFriendRequests = async (userId) => {
  try {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    const requests = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        toUserId: data.toUserId,
        toUserName: data.toUserName,
        createdAt: data.createdAt,
        status: data.status,
      });
    });

    // Sort by creation date (newest first)
    requests.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.seconds - a.createdAt.seconds;
    });

    return requests;
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
};

// Listen to pending friend requests (real-time)
export const subscribeToPendingFriendRequests = (userId, callback) => {
  try {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const requests = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          requests.push({
            id: doc.id,
            fromUserId: data.fromUserId,
            fromUserName: data.fromUserName,
            toUserId: data.toUserId,
            toUserName: data.toUserName,
            createdAt: data.createdAt,
            status: data.status,
          });
        });

        // Sort by creation date (newest first)
        requests.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt.seconds - a.createdAt.seconds;
        });

        callback(requests);
      },
      (error) => {
        console.error('Error in friend requests listener:', error);
        callback([]);
      }
    );
  } catch (error) {
    console.error('Error setting up friend requests listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

// Remove friend
export const removeFriend = async (userId1, userId2) => {
  try {
    // Remove from both users' friends arrays
    const user1Ref = doc(db, 'users', userId1);
    const user2Ref = doc(db, 'users', userId2);

    await updateDoc(user1Ref, {
      friends: arrayRemove(userId2),
    });

    await updateDoc(user2Ref, {
      friends: arrayRemove(userId1),
    });

    console.log('Friend removed successfully');
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

// Decline friend request
export const declineFriendRequest = async (requestId) => {
  try {
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, {
      status: 'declined',
      declinedAt: serverTimestamp(),
    });
    console.log('Friend request declined successfully');
  } catch (error) {
    console.error('Error declining friend request:', error);
    throw error;
  }
};
