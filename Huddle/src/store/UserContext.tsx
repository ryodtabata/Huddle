import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase/configFirebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  profileImage?: string;
  bio?: string;
  age?: number;
  hideAge?: boolean;
  interests?: string;
  createdAt?: any;
  location?: any;
}

interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string) => {
    try {
      console.log('Fetching user profile for UID:', uid);
      const userDoc = await getDoc(doc(db, 'users', uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User profile data:', userData);

        setUserProfile({
          uid,
          email: userData.email,
          displayName: userData.displayName,
          profileImage: userData.profileImage,
          bio: userData.bio,
          age: userData.age,
          hideAge: userData.hideAge || false,
          interests: userData.interests,
          createdAt: userData.createdAt,
          location: userData.location || null,
        });
      } else {
        console.log('No user profile found in Firestore');
        setUserProfile({
          uid,
          email: user?.email || '',
          displayName: user?.displayName ?? undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to basic auth info
      setUserProfile({
        uid,
        email: user?.email || '',
        displayName: user?.displayName ?? undefined,
      });
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log('Auth state changed:', authUser?.email || 'No user');
      setUser(authUser);

      if (authUser) {
        await fetchUserProfile(authUser.uid);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener with better error handling
  useEffect(() => {
    if (user) {
      console.log('Setting up real-time listener for user:', user.uid);

      const unsubscribe = onSnapshot(
        doc(db, 'users', user.uid),
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            console.log('Real-time user profile update:', userData);

            setUserProfile({
              uid: user.uid,
              email: userData.email,
              displayName: userData.displayName,
              profileImage: userData.profileImage,
              bio: userData.bio,
              age: userData.age,
              hideAge: userData.hideAge || false,
              interests: userData.interests,
              createdAt: userData.createdAt,
              location: userData.location || null,
            });
          } else {
            console.log('User document does not exist in real-time listener');
          }
        },
        (error) => {
          console.error('Error in real-time listener:', error);
          // Don't crash the app, just log the error
          // The user can still use cached data
        }
      );

      return () => {
        console.log('Cleaning up real-time listener');
        unsubscribe();
      };
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{ user, userProfile, loading, refreshUserProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
