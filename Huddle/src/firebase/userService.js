import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './configFirebase';

// Get nearby users for messaging
export const getNearbyUsers = async (currentUserId, maxDistance = 10000) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '!=', currentUserId));

    const snapshot = await getDocs(q);
    const users = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: data.uid,
        uid: data.uid,
        name: data.displayName || data.email || 'Unknown User',
        displayName: data.displayName,
        email: data.email,
        profileImage: data.profileImage,
        bio: data.bio,
        age: data.age,
        hideAge: data.hideAge,
        interests: data.interests,
        location: data.location,
      });
    });

    return users;
  } catch (error) {
    console.error('Error getting nearby users:', error);
    throw error;
  }
};

// Get user profile by ID
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: data.uid,
        uid: data.uid,
        name: data.displayName || data.email || 'Unknown User',
        displayName: data.displayName,
        email: data.email,
        profileImage: data.profileImage,
        bio: data.bio,
        age: data.age,
        hideAge: data.hideAge,
        interests: data.interests,
        location: data.location,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Search users by name
export const searchUsers = async (searchTerm, currentUserId) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '!=', currentUserId));

    const snapshot = await getDocs(q);
    const users = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const name = data.displayName || data.email || 'Unknown User';

      // Simple client-side filtering by name
      if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
        users.push({
          id: data.uid,
          uid: data.uid,
          name: name,
          displayName: data.displayName,
          email: data.email,
          profileImage: data.profileImage,
          bio: data.bio,
          age: data.age,
          hideAge: data.hideAge,
          interests: data.interests,
          location: data.location,
        });
      }
    });

    return users;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};
