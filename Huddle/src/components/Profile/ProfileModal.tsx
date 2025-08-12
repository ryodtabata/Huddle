import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { ProfileCard } from './ProfileCard';
import { ConfirmationModal } from '../ConfirmationModal';
import {
  sendFriendRequest,
  removeFriend,
  areUsersFriends,
} from '../../firebase/friendsService';
import { useUser } from '../../store/UserContext';
import { useTheme } from '@react-navigation/native';

type Person = {
  id: string;
  name: string;
  age: number;
  bio: string;
  distance: string;
  imageUrl: string;
  verified: boolean;
};

interface ProfileModalProps {
  visible: boolean;
  person: Person | null;
  onClose: () => void;
  isFriend?: boolean;
  onMessage?: (person: Person) => void;
}
export function ProfileModal({
  visible,
  person,
  onClose,
  isFriend = false,
  onMessage,
}: ProfileModalProps) {
  const { user, userProfile } = useUser();
  const { colors } = useTheme();
  const [isActuallyFriend, setIsActuallyFriend] = useState(isFriend);
  const [checkingFriendship, setCheckingFriendship] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    title: string;
    message: string;
    confirmText: string;
    isDestructive: boolean;
  } | null>(null);

  const isDarkMode =
    colors.background === '#000000' || colors.background.includes('#1');

  // Check if users are actually friends when modal opens
  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (!person || !user?.uid || !visible) return;

      setCheckingFriendship(true);
      try {
        console.log('Checking friendship between:', user.uid, 'and', person.id);
        const friendshipStatus = await areUsersFriends(user.uid, person.id);
        console.log('Friendship status:', friendshipStatus);
        setIsActuallyFriend(friendshipStatus);
      } catch (error) {
        console.error('Error checking friendship status:', error);
        setIsActuallyFriend(isFriend); // Fallback to prop value
      } finally {
        setCheckingFriendship(false);
      }
    };

    checkFriendshipStatus();
  }, [visible, person, user?.uid, isFriend]);

  const handleAddFriend = async () => {
    console.log('=== HANDLE ADD FRIEND START ===');
    console.log('Handling add friend for:', person?.name);
    console.log('isActuallyFriend:', isActuallyFriend);

    if (!person || !user) {
      console.log('EARLY RETURN: Missing person or user');
      return;
    }

    const title = isActuallyFriend ? 'Remove Friend' : 'Add Friend';
    const message = isActuallyFriend
      ? `Remove ${person.name} from your friends?`
      : `Send friend request to ${person.name}?`;
    const confirmText = isActuallyFriend ? 'Remove' : 'Send Request';

    console.log('Setting up confirmation modal with:', {
      title,
      message,
      confirmText,
    });

    setConfirmationData({
      title,
      message,
      confirmText,
      isDestructive: isActuallyFriend,
    });
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    console.log('User confirmed action');
    setShowConfirmation(false);
    setProcessingAction(true);

    if (!person || !user) {
      setProcessingAction(false);
      return;
    }

    try {
      if (isActuallyFriend) {
        // Remove friend
        console.log('Removing friend:', person.name);
        await removeFriend(user.uid, person.id);
        setIsActuallyFriend(false); // Update local state to show "Add Friend"
        Alert.alert(
          'Success',
          `${person.name} has been removed from your friends.`
        );
      } else {
        // Send friend request
        console.log('About to send friend request to:', person.name);
        console.log('User ID:', user.uid, 'Person ID:', person.id);

        await sendFriendRequest(
          user.uid,
          person.id,
          userProfile?.displayName || user.displayName || 'Unknown',
          person.name
        );

        console.log('Friend request sent successfully');
        Alert.alert('Success', `Friend request sent to ${person.name}!`);
      }
      // Don't close modal automatically - let user see the state change
    } catch (error: any) {
      console.log('Error with friend action:', error);
      const errorMessage =
        error?.message || 'Failed to complete action. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCancelAction = () => {
    console.log('User cancelled action');
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const handleMessage = () => {
    if (person && onMessage) {
      onMessage(person);
      onClose();
    }
  };

  const handleBlock = () => {
    if (person) {
      Alert.alert(
        'Block User',
        `Are you sure you want to block ${person.name}? They won't be able to contact you and you won't see their profile anymore.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Block',
            style: 'destructive',
            onPress: () => {
              // TODO: Implement block functionality
              Alert.alert('Blocked', `${person.name} has been blocked.`);
              onClose();
            },
          },
        ]
      );
    }
  };

  const handleReport = () => {
    if (person) {
      Alert.alert(
        'Report User',
        `Report ${person.name} for inappropriate behavior?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Report',
            style: 'destructive',
            onPress: () => {
              // TODO: Implement report functionality
              Alert.alert(
                'Reported',
                `${person.name} has been reported. Thank you for keeping our community safe.`
              );
              onClose();
            },
          },
        ]
      );
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View
          style={[
            styles.modalBackground,
            {
              backgroundColor: isDarkMode
                ? 'rgba(0,0,0,0.8)'
                : 'rgba(24,28,36,0.92)',
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? '#2a2a2a' : 'transparent' },
            ]}
          >
            {person && (
              <ProfileCard
                name={person.name}
                age={person.age}
                bio={person.bio}
                distance={person.distance}
                imageUrl={person.imageUrl}
                verified={person.verified}
              />
            )}

            <View style={styles.buttonContainer}>
              {isActuallyFriend && onMessage && (
                <Pressable
                  style={[styles.actionButton, styles.messageButton]}
                  onPress={handleMessage}
                >
                  <Text style={styles.messageButtonText}>Message</Text>
                </Pressable>
              )}

              <Pressable
                style={[
                  styles.actionButton,
                  isActuallyFriend
                    ? styles.removeFriendButton
                    : styles.addFriendButton,
                  (checkingFriendship || processingAction) &&
                    styles.disabledButton,
                ]}
                onPress={handleAddFriend}
                disabled={checkingFriendship || processingAction}
              >
                <Text
                  style={
                    isActuallyFriend
                      ? styles.removeFriendButtonText
                      : styles.addFriendButtonText
                  }
                >
                  {checkingFriendship
                    ? 'Loading...'
                    : processingAction
                    ? 'Processing...'
                    : isActuallyFriend
                    ? 'Remove Friend'
                    : 'Add Friend'}
                </Text>
              </Pressable>

              <View style={styles.secondaryButtonsRow}>
                <Pressable
                  style={[styles.actionButton, styles.blockButton]}
                  onPress={handleBlock}
                >
                  <Text style={styles.blockButtonText}>Block</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.reportButton]}
                  onPress={handleReport}
                >
                  <Text style={styles.reportButtonText}>Report</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDarkMode ? '#3a3a3a' : '#232a36',
                  borderColor: isDarkMode ? '#5a5a5a' : '#4fc3f7',
                },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.closeButtonText,
                  { color: isDarkMode ? colors.text : '#4fc3f7' },
                ]}
              >
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {confirmationData && (
        <ConfirmationModal
          visible={showConfirmation}
          title={confirmationData.title}
          message={confirmationData.message}
          confirmText={confirmationData.confirmText}
          confirmStyle={
            confirmationData.isDestructive ? 'destructive' : 'default'
          }
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(24,28,36,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '94%',
    backgroundColor: 'transparent',
    borderRadius: 20,
    alignItems: 'center',
    padding: 16,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addFriendButton: {
    backgroundColor: '#4fc3f7',
  },
  addFriendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageButton: {
    backgroundColor: '#4fc3f7',
  },
  messageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeFriendButton: {
    backgroundColor: '#ff6b6b',
  },
  removeFriendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  blockButton: {
    flex: 1,
    backgroundColor: '#ff6b6b',
  },
  blockButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#ff8c42',
  },
  reportButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: '#232a36',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4fc3f7',
  },
  closeButtonText: {
    color: '#4fc3f7',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
