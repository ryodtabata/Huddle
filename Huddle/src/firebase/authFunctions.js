import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './configFirebase';

export const signUpWithEmail = async (email, password) => {
  console.log('signUpWithEmail called with:', email, password);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signInWithGoogle = async () => {
  // Placeholder for now - implement Google Sign-In later
  throw new Error('Google Sign-In not implemented yet');
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};
