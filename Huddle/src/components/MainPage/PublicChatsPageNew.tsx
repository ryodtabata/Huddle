import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useUser } from '../../store/UserContext';
import {
  getAvailableLocationGroups,
  createLocationGroupChat,
  findAndJoinLocationGroupChats,
  leaveLocationGroupChat,
} from './makeGroupChats';
import Ionicons from '@expo/vector-icons/Ionicons';
import PublicChatConvo from './PublicChatConvo';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PublicChatsPage = () => {
  const { user, userProfile } = useUser();
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupRadius, setGroupRadius] = useState('100'); // Default 100 meters
  const { colors } = useTheme();

  useEffect(() => {
    if (user && userProfile && userProfile.location) {
      loadAvailableGroups();
      autoJoinNearbyGroups();
    }
  }, [user, userProfile]);

  const autoJoinNearbyGroups = async () => {
    if (!user || !userProfile || !userProfile.location) return;
    try {
      await findAndJoinLocationGroupChats({
        id: user.uid,
        name: userProfile.displayName || user.email || 'Unknown User',
        location: userProfile.location,
      });
      // Refresh the list after joining
      loadAvailableGroups();
    } catch (error) {
      console.error('Error auto-joining nearby groups:', error);
    }
  };

  const loadAvailableGroups = async () => {
    if (!user || !userProfile?.location) return;
    try {
      const groups = await getAvailableLocationGroups({
        id: user.uid,
        name: userProfile.displayName || user.email || 'Unknown User',
        location: userProfile.location,
      });
      setAvailableGroups(groups);
    } catch (error) {
      console.error('Error loading available groups:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAvailableGroups();
    } catch (error) {
      console.error('Error refreshing groups:', error);
      Alert.alert('Error', 'Failed to refresh groups');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !userProfile?.location) return;

    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    const radius = parseInt(groupRadius);
    if (isNaN(radius) || radius < 50 || radius > 5000) {
      Alert.alert('Error', 'Radius must be between 50 and 5000 meters');
      return;
    }

    try {
      await createLocationGroupChat(
        {
          id: user.uid,
          name: userProfile.displayName || user.email || 'Unknown User',
          location: userProfile.location,
        },
        groupName.trim(),
        radius
      );

      setShowCreateModal(false);
      setGroupName('');
      setGroupRadius('100');
      loadAvailableGroups();
      Alert.alert('Success', 'Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    }
  };

  const handleJoinGroup = async (group: any) => {
    if (!user || !userProfile?.location) return;

    try {
      await findAndJoinLocationGroupChats({
        id: user.uid,
        name: userProfile.displayName || user.email || 'Unknown User',
        location: userProfile.location,
      });
      loadAvailableGroups();
      Alert.alert('Success', `Joined ${group.name}!`);
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const renderGroupItem = ({ item }: any) => (
    <View style={[styles.groupItem, { borderBottomColor: colors.card }]}>
      <Pressable
        style={[styles.groupContent, { backgroundColor: colors.background }]}
        onPress={() => setSelectedChat(item)}
      >
        <View style={[styles.groupIcon, { backgroundColor: colors.card }]}>
          <Ionicons name="location" size={24} color={(colors as any).accent} />
        </View>
        <View style={styles.groupInfo}>
          <Text style={[styles.groupName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text
            style={[styles.groupDetails, { color: (colors as any).accent }]}
          >
            {item.participantCount} people • {Math.round(item.distanceFromUser)}
            m away
          </Text>
          <Text
            style={[styles.groupDescription, { color: colors.text + '99' }]}
          >
            Radius: {item.radius}m • Created{' '}
            {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.joinButton,
            { backgroundColor: (colors as any).accent },
          ]}
          onPress={() => handleJoinGroup(item)}
        >
          <Text style={[styles.joinButtonText, { color: 'white' }]}>Join</Text>
        </TouchableOpacity>
      </Pressable>
    </View>
  );

  if (!userProfile?.location) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.noLocationContainer}>
          <Ionicons
            name="location-outline"
            size={64}
            color={colors.text + '99'}
          />
          <Text style={[styles.noLocationTitle, { color: colors.text }]}>
            Location Required
          </Text>
          <Text style={[styles.noLocationText, { color: colors.text + '99' }]}>
            Enable location services to join location-based group chats in your
            area.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.card }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              Location Groups
            </Text>
            <Text style={[styles.subtitle, { color: colors.text + '99' }]}>
              Join or create location-based group chats
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: (colors as any).accent },
            ]}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={availableGroups}
        keyExtractor={(item) => item.id}
        renderItem={renderGroupItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={(colors as any).accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={64}
              color={colors.text + '99'}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Location Groups
            </Text>
            <Text style={[styles.emptyText, { color: colors.text + '99' }]}>
              No groups available in your area. Create one or pull to refresh!
            </Text>
          </View>
        }
        contentContainerStyle={
          availableGroups.length === 0 ? styles.emptyList : styles.list
        }
        style={{ flex: 1, width: '100%' }}
      />

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Create Location Group
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Group Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { borderColor: colors.card, color: colors.text },
                ]}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Enter group name"
                placeholderTextColor={colors.text + '66'}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Radius (meters)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { borderColor: colors.card, color: colors.text },
                ]}
                value={groupRadius}
                onChangeText={setGroupRadius}
                placeholder="100"
                placeholderTextColor={colors.text + '66'}
                keyboardType="numeric"
              />
              <Text style={[styles.helperText, { color: colors.text + '99' }]}>
                People within this radius can join your group (50-5000m)
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.card }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: (colors as any).accent },
                ]}
                onPress={handleCreateGroup}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {selectedChat && (
        <PublicChatConvo
          chat={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    padding: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 0,
  },
  emptyList: {
    flex: 1,
  },
  groupItem: {
    borderBottomWidth: 1,
    width: '100%',
  },
  groupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  groupDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 12,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noLocationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noLocationText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  helperText: {
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PublicChatsPage;
