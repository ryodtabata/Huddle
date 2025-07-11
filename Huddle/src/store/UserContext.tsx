import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase/configFirebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { setUserLocation } from '../firebase/geoService';
import * as Location from 'expo-location';

// --- Define UserProfile type ---
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

// --- Define UserContextType to match your context value ---
interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
}

// --- Create context with correct type ---
const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Location update effect
  useEffect(() => {
    let intervalId: any;

    const updateLocation = async () => {
      if (!user) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});
      await setUserLocation(
        user.uid,
        location.coords.latitude,
        location.coords.longitude,
        {
          displayName: user.displayName,
          email: user.email,
        }
      );
    };

    if (user) {
      updateLocation();
      intervalId = setInterval(updateLocation, 60 * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  // Fetch user profile
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
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
        setUserProfile({
          uid,
          email: user?.email || '',
          displayName: user?.displayName ?? undefined,
        });
      }
    } catch (error) {
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

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
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
        }
      });
      return () => unsubscribe();
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
