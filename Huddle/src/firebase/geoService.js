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

const GEOHASH_PRECISION = 6; // Use the same precision as your query bounds

// Set or update user location with geohash
export const setUserLocation = async (
  userId,
  latitude,
  longitude,
  userData = {}
) => {
  try {
    const geohash = geohashForLocation([latitude, longitude]).substring(
      0,
      GEOHASH_PRECISION
    );
    await setDoc(
      doc(db, 'users', userId),
      {
        ...userData,
        location: {
          latitude,
          longitude,
          geohash, // store prefix only
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
  const promises = [];
  const usersRef = collection(db, 'users');

  console.log('Query bounds:', bounds);

  for (const b of bounds) {
    const q = query(
      usersRef,
      where('location.geohash', '>=', b[0]),
      where('location.geohash', '<=', b[1])
    );
    const snap = await getDocs(q);
    console.log(`Bound ${b[0]} - ${b[1]}: ${snap.docs.length} docs`);
    snap.docs.forEach((docSnap) => {
      console.log('Doc:', docSnap.id, docSnap.data());
    });
    promises.push(Promise.resolve(snap));
  }

  const snapshots = await Promise.all(promises);
  let totalDocs = 0;
  const matchingDocs = [];

  for (const snap of snapshots) {
    totalDocs += snap.docs.length;
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      console.log('Doc:', docSnap.id, data); // <-- Log each doc returned
      if (
        (excludeUserId === null || docSnap.id !== excludeUserId) &&
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
