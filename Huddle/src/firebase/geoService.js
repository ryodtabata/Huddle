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

const GEOHASH_PRECISION = 7; //might need to mess with this later

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
          geohash,
        },
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
//chat "optimized" this but it might be shit, also only want to fetch reccerntly online popel, AND users able to change thier own location/distances which daddy dont like
export const getNearbyUsers = async (
  latitude,
  longitude,
  radiusMeters,
  excludeUserId
) => {
  try {
    const center = [latitude, longitude];
    const radiusKm = radiusMeters / 1000; // Convert to km for geofire-common
    const bounds = geohashQueryBounds(center, radiusKm);

    const usersRef = collection(db, 'users');

    // **OPTIMIZATION 1: Parallel queries instead of sequential**
    const queryPromises = bounds.map(([start, end]) =>
      getDocs(
        query(
          usersRef,
          where('location.geohash', '>=', start),
          where('location.geohash', '<=', end)
          // **OPTIMIZATION 2: Add time filter to get active users only**
        )
      )
    );

    const snapshots = await Promise.all(queryPromises);

    // **OPTIMIZATION 3: Use Set for deduplication (faster than Map)**
    const seenUsers = new Set();
    const matchingUsers = [];

    for (const snapshot of snapshots) {
      for (const doc of snapshot.docs) {
        // Skip if already processed
        if (seenUsers.has(doc.id)) continue;
        seenUsers.add(doc.id);

        // Skip excluded user
        if (doc.id === excludeUserId) continue;

        const data = doc.data();
        if (!data.location?.latitude || !data.location?.longitude) continue;

        // **OPTIMIZATION 4: Use squared distance for initial filtering (faster)**
        const latDiff = data.location.latitude - latitude;
        const lngDiff = data.location.longitude - longitude;
        const approxDistSq = latDiff * latDiff + lngDiff * lngDiff;
        const maxDistSq = (radiusKm / 111) * (radiusKm / 111); // Rough conversion

        // Quick rejection of obviously far users
        if (approxDistSq > maxDistSq * 4) continue;

        // Precise distance calculation only for potential matches
        const preciseDistance = distanceBetween(center, [
          data.location.latitude,
          data.location.longitude,
        ]);

        if (preciseDistance <= radiusKm) {
          matchingUsers.push({
            uid: doc.id,
            ...data,
            distance: preciseDistance * 1000, // Convert back to meters
          });
        }
      }
    }

    // Sort by distance
    matchingUsers.sort((a, b) => a.distance - b.distance);

    console.log(`Found ${matchingUsers.length} users within ${radiusMeters}m`);
    return matchingUsers;
  } catch (error) {
    console.error('Error finding nearby users:', error);
    return [];
  }
};
