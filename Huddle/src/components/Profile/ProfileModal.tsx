import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Alert } from 'react-native';
import { ProfileCard } from './ProfileCard';

type Person = {
  id: string;
  name: string;
  age: number;
  bio: string;
  distance: string;
  imageUrl: string;
  verified: boolean;
  tags: string[];
};

interface ProfileModalProps {
  visible: boolean;
  person: Person | null;
  onClose: () => void;
  isFriend?: boolean;
  onMessage?: (person: Person) => void;
}

//need to make block and report and add friend fucntionality
export function ProfileModal({
  visible,
  person,
  onClose,
  isFriend = false,
  onMessage,
}: ProfileModalProps) {
  const handleAddFriend = () => {
    if (person) {
      const action = isFriend ? 'Remove Friend' : 'Add Friend';
      const message = isFriend
        ? `Remove ${person.name} from your friends?`
        : `Send friend request to ${person.name}?`;
      const confirmText = isFriend ? 'Remove' : 'Send Request';
      const successMessage = isFriend
        ? `${person.name} has been removed from your friends.`
        : `Friend request sent to ${person.name}!`;

      Alert.alert(action, message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: confirmText,
          style: isFriend ? 'destructive' : 'default',
          onPress: () => {
            // TODO: Implement add/remove friend functionality
            Alert.alert('Success', successMessage);
            onClose();
          },
        },
      ]);
    }
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          {person && (
            <ProfileCard
              name={person.name}
              age={person.age}
              bio={person.bio}
              distance={person.distance}
              imageUrl={person.imageUrl}
              verified={person.verified}
              tags={person.tags}
            />
          )}

          <View style={styles.buttonContainer}>
            {isFriend && onMessage && (
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
                isFriend ? styles.removeFriendButton : styles.addFriendButton,
              ]}
              onPress={handleAddFriend}
            >
              <Text
                style={
                  isFriend
                    ? styles.removeFriendButtonText
                    : styles.addFriendButtonText
                }
              >
                {isFriend ? 'Remove Friend' : 'Add Friend'}
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

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
