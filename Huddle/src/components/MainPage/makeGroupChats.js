import { db } from '../../firebase/configFirebase';
import {
  doc,
  getDoc,
  writeBatch,
  arrayUnion,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { distanceBetween } from 'geofire-common';

// Create a new location-based group chat
export const createLocationGroupChat = async (
  creatorUser,
  groupName,
  radiusMeters = 100
) => {
  try {
    console.log('Creating location group chat with:', {
      creatorUser,
      groupName,
      radiusMeters,
    });

    if (!creatorUser.location?.latitude || !creatorUser.location?.longitude) {
      console.error('Creator location is missing:', creatorUser.location);
      throw new Error('Creator location is required');
    }

    const groupData = {
      name: groupName,
      creatorId: creatorUser.id,
      creatorName: creatorUser.name,
      centerLocation: {
        latitude: creatorUser.location.latitude,
        longitude: creatorUser.location.longitude,
      },
      radius: radiusMeters, // radius in meters
      participants: [creatorUser.id],
      participantNames: {
        [creatorUser.id]: creatorUser.name,
      },
      participantCount: 1,
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null,
      isActive: true,
      type: 'location',
    };

    console.log('Group data to create:', groupData);

    // Create the group chat
    console.log('About to create document in groupChats collection...');
    const groupRef = await addDoc(collection(db, 'groupChats'), groupData);
    console.log('Group created with ID:', groupRef.id);

    // Add group to creator's groupchats array
    console.log('About to update user document...');
    const userRef = doc(db, 'users', creatorUser.id);

    // First check if user document exists
    const userDoc = await getDoc(userRef);
    console.log('User document exists:', userDoc.exists());
    if (userDoc.exists()) {
      console.log('User document data:', userDoc.data());
    }

    await updateDoc(userRef, {
      groupchats: arrayUnion(groupRef.id),
    });

    console.log('Location group chat created successfully:', groupRef.id);
    return groupRef.id;
  } catch (error) {
    console.error('Error creating location group chat:', error);
    console.error('Error details:', error.code, error.message);
    throw error;
  }
};

// Find and join available location-based group chats
export const findAndJoinLocationGroupChats = async (currentUser) => {
  try {
    if (!currentUser.location?.latitude || !currentUser.location?.longitude) {
      console.log('User location not available');
      return [];
    }

    // Get all active location-based group chats
    const groupChatsRef = collection(db, 'groupChats');
    const q = query(
      groupChatsRef,
      where('type', '==', 'location'),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const availableGroups = [];
    const groupsToJoin = [];

    for (const docSnap of snapshot.docs) {
      const groupData = docSnap.data();
      const groupId = docSnap.id;

      // Skip if user is already in this group
      if (groupData.participants?.includes(currentUser.id)) {
        continue;
      }

      // Check if user is within the group's radius
      const distance = distanceBetween(
        [currentUser.location.latitude, currentUser.location.longitude],
        [groupData.centerLocation.latitude, groupData.centerLocation.longitude]
      );

      const distanceMeters = distance * 1000; // convert to meters

      if (distanceMeters <= groupData.radius) {
        availableGroups.push({
          id: groupId,
          ...groupData,
          distanceFromUser: distanceMeters,
        });
        groupsToJoin.push({ groupId, groupData });
      }
    }

    // Auto-join user to groups they're within range of
    if (groupsToJoin.length > 0) {
      await joinUserToGroups(currentUser, groupsToJoin);
    }

    console.log(`Found ${availableGroups.length} location groups within range`);
    return availableGroups;
  } catch (error) {
    console.error('Error finding location group chats:', error);
    return [];
  }
};

// Join user to multiple location groups
const joinUserToGroups = async (user, groupsToJoin) => {
  try {
    const batch = writeBatch(db);
    const groupIds = [];

    for (const { groupId, groupData } of groupsToJoin) {
      const groupRef = doc(db, 'groupChats', groupId);

      // Update group participants
      const updatedParticipants = [...(groupData.participants || []), user.id];
      const updatedParticipantNames = {
        ...(groupData.participantNames || {}),
        [user.id]: user.name,
      };

      batch.update(groupRef, {
        participants: updatedParticipants,
        participantNames: updatedParticipantNames,
        participantCount: updatedParticipants.length,
      });

      groupIds.push(groupId);
    }

    // Update user's groupchats array
    const userRef = doc(db, 'users', user.id);
    batch.update(userRef, {
      groupchats: arrayUnion(...groupIds),
    });

    await batch.commit();
    console.log(`User ${user.name} joined ${groupIds.length} location groups`);
    return groupIds;
  } catch (error) {
    console.error('Error joining user to groups:', error);
    return [];
  }
};

// Leave a location group chat
export const leaveLocationGroupChat = async (userId, groupId) => {
  try {
    const groupRef = doc(db, 'groupChats', groupId);
    const groupDoc = await getDoc(groupRef);

    if (!groupDoc.exists()) {
      throw new Error('Group chat not found');
    }

    const groupData = groupDoc.data();
    const updatedParticipants = (groupData.participants || []).filter(
      (id) => id !== userId
    );
    const updatedParticipantNames = { ...groupData.participantNames };
    delete updatedParticipantNames[userId];

    const batch = writeBatch(db);

    // If no participants left, deactivate the group
    if (updatedParticipants.length === 0) {
      batch.update(groupRef, {
        isActive: false,
        participants: [],
        participantNames: {},
        participantCount: 0,
      });
    } else {
      batch.update(groupRef, {
        participants: updatedParticipants,
        participantNames: updatedParticipantNames,
        participantCount: updatedParticipants.length,
      });
    }

    // Remove group from user's groupchats array
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedUserGroups = (userData.groupchats || []).filter(
        (id) => id !== groupId
      );
      batch.update(userRef, {
        groupchats: updatedUserGroups,
      });
    }

    await batch.commit();
    console.log(`User left group ${groupId}`);
    return true;
  } catch (error) {
    console.error('Error leaving group chat:', error);
    return false;
  }
};

// Get location groups user can join (within radius but not already joined)
export const getAvailableLocationGroups = async (currentUser) => {
  try {
    if (!currentUser.location?.latitude || !currentUser.location?.longitude) {
      return [];
    }

    const groupChatsRef = collection(db, 'groupChats');
    const q = query(
      groupChatsRef,
      where('type', '==', 'location'),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    const availableGroups = [];

    for (const docSnap of snapshot.docs) {
      const groupData = docSnap.data();
      const groupId = docSnap.id;

      // Skip if user is already in this group
      if (groupData.participants?.includes(currentUser.id)) {
        continue;
      }

      // Check if user is within the group's radius
      const distance = distanceBetween(
        [currentUser.location.latitude, currentUser.location.longitude],
        [groupData.centerLocation.latitude, groupData.centerLocation.longitude]
      );

      const distanceMeters = distance * 1000;

      if (distanceMeters <= groupData.radius) {
        availableGroups.push({
          id: groupId,
          ...groupData,
          distanceFromUser: distanceMeters,
        });
      }
    }

    // Sort by distance
    availableGroups.sort((a, b) => a.distanceFromUser - b.distanceFromUser);
    return availableGroups;
  } catch (error) {
    console.error('Error getting available location groups:', error);
    return [];
  }
};

// Get user's joined location groups
export const getUserLocationGroups = async (currentUser) => {
  try {
    if (!currentUser.location?.latitude || !currentUser.location?.longitude) {
      return [];
    }

    const groupChatsRef = collection(db, 'groupChats');
    const q = query(
      groupChatsRef,
      where('type', '==', 'location'),
      where('isActive', '==', true),
      where('participants', 'array-contains', currentUser.id)
    );

    const snapshot = await getDocs(q);
    const userGroups = [];

    for (const docSnap of snapshot.docs) {
      const groupData = docSnap.data();
      const groupId = docSnap.id;

      // Calculate distance from user to group center
      const distance = distanceBetween(
        [currentUser.location.latitude, currentUser.location.longitude],
        [groupData.centerLocation.latitude, groupData.centerLocation.longitude]
      );

      const distanceMeters = distance * 1000;

      userGroups.push({
        id: groupId,
        ...groupData,
        distanceFromUser: distanceMeters,
      });
    }

    // Sort by distance
    userGroups.sort((a, b) => a.distanceFromUser - b.distanceFromUser);
    return userGroups;
  } catch (error) {
    console.error('Error getting user location groups:', error);
    return [];
  }
};
