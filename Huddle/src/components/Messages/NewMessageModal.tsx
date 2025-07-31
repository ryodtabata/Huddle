import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getUserFriends } from '../../firebase/friendsService';
import { useUser } from '../../store/UserContext';
import { useTheme } from '@react-navigation/native';

type Friend = {
  id: string;
  name: string;
  imageUrl: string;
  hasActiveConvo: boolean;
};

interface NewMessageModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFriend: (friend: Friend) => void;
}

export function NewMessageModal({
  visible,
  onClose,
  onSelectFriend,
}: NewMessageModalProps) {
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Load user's friends when modal opens
  useEffect(() => {
    if (visible && user) {
      loadUserFriends();
    }
  }, [visible, user]);

  const loadUserFriends = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const friends = await getUserFriends(user.uid);
      setUsers(friends);
      setFilteredUsers(friends);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  //Filter friends as user types
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const handleSelectFriend = (friend: any) => {
    onSelectFriend(friend);
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.card }]}>
          <Pressable style={styles.backButton} onPress={onClose}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={(colors as any).accent}
            />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Message Friends
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchBar,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            placeholder="Search friends..."
            placeholderTextColor={colors.text + '99'}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Users List */}
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.friendItem, { borderBottomColor: colors.card }]}
              onPress={() => handleSelectFriend(item)}
            >
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: (colors as any).accent },
                ]}
              >
                <Text style={[styles.avatarText, { color: colors.background }]}>
                  {item.name ? item.name[0].toUpperCase() : '?'}
                </Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text
                  style={[styles.friendStatus, { color: colors.text + '99' }]}
                >
                  {item.bio || 'Start new chat'}
                </Text>
              </View>
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={(colors as any).accent}
              />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text + '99' }]}>
                {loading
                  ? 'Loading friends...'
                  : 'No friends found. Add friends to start messaging!'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});
