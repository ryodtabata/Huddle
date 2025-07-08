import { db } from './configFirebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import {
  geohashForLocation,
  geohashQueryBounds,
  distanceBetween,
} from 'geofire-common';

// Set or update user location with geohash
export const setUserLocation = async (
  userId,
  latitude,
  longitude,
  userData = {}
) => {
  try {
    const geohash = geohashForLocation([latitude, longitude]);
    await setDoc(
      doc(db, 'users', userId),
      {
        ...userData,
        location: {
          latitude,
          longitude,
          geohash,
          lastUpdated: new Date(),
        },
        isOnline: true,
        lastSeen: new Date(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error('setUserLocation error:', error);
    return { success: false, error };
  }
};

// Query for nearby users using geohash bounding box and Haversine filter
export const getNearbyUsers = async (
  latitude,
  longitude,
  radiusKm = 50,
  excludeUserId = null
) => {
  const center = [latitude, longitude];
  const bounds = geohashQueryBounds(center, radiusKm);
  const usersRef = collection(db, 'users');
  const promises = [];

  for (const b of bounds) {
    const q = query(
      usersRef,
      where('location.geohash', '>=', b[0]),
      where('location.geohash', '<=', b[1]),
      where('isOnline', '==', true)
    );
    promises.push(getDocs(q));
  }

  const snapshots = await Promise.all(promises);
  const matchingDocs = [];

  for (const snap of snapshots) {
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (
        docSnap.id !== excludeUserId &&
        data.location &&
        typeof data.location.latitude === 'number' &&
        typeof data.location.longitude === 'number'
      ) {
        const dist = distanceBetween(
          [latitude, longitude],
          [data.location.latitude, data.location.longitude]
        );
        if (dist <= radiusKm) {
          matchingDocs.push({
            uid: docSnap.id,
            ...data,
            distance: dist,
          });
        }
      }
    }
  }

  // Remove duplicates (can happen if a user is in multiple bounds)
  const uniqueUsers = Array.from(
    new Map(matchingDocs.map((u) => [u.uid, u])).values()
  );

  // Sort by distance
  uniqueUsers.sort((a, b) => a.distance - b.distance);

  return uniqueUsers;
};
