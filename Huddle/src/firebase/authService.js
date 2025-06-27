import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./configFirebase";

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Sign up with email and password
export const signUpWithEmailAndPassword = async (
  email,
  password,
  displayName
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName,
    });

    // Create user document in Firestore
    await createUserDocument(user, { displayName });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Create user document in Firestore if it doesn't exist
    await createUserDocument(user);

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create user document in Firestore
export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();

    try {
      await setDoc(userRef, {
        displayName: displayName || additionalData.displayName,
        email,
        photoURL: photoURL || null,
        createdAt,
        age: null,
        bio: "",
        tags: [],
        hideAge: false,
        verified: false,
        lastSeen: createdAt,
        ...additionalData,
      });
    } catch (error) {
      console.log("Error creating user document:", error);
    }
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete user account
export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Delete user document from Firestore
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef);

      // Delete user from Firebase Auth
      await deleteUser(user);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
