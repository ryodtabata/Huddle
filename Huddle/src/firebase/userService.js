import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './configFirebase';

// Get user profile by ID, should be useful to add friends/block/unadd/report/ ... in future
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
