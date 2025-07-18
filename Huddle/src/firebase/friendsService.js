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

//need to go and fix this

// Send friend request
export const sendFriendRequest = async (
  fromUserId,
  toUserId,
  fromUserName,
  toUserName
) => {
  try {
    const requestRef = collection(db, 'friendRequests');
    await addDoc(requestRef, {
      fromUserId,
      toUserId,
      fromUserName,
      toUserName,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
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
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const friendIds = userData.friends || [];

      // Get friend profiles
      const friends = [];
      for (const friendId of friendIds) {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        if (friendDoc.exists()) {
          const friendData = friendDoc.data();
          friends.push({
            id: friendData.uid,
            uid: friendData.uid,
            name: friendData.displayName || friendData.email || 'Unknown User',
            displayName: friendData.displayName,
            email: friendData.email,
            profileImage: friendData.profileImage,
            bio: friendData.bio,
          });
        }
      }

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
        createdAt: data.createdAt,
      });
    });

    return requests;
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw error;
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
