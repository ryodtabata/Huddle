import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MessagesConvo from './MessagesConvo';
import { NewMessageModal } from './NewMessageModal';
import {
  subscribeToConversations,
  createConversation,
} from '../../firebase/messageService';
import { useUser } from '../../store/UserContext';
import { useTheme } from '@react-navigation/native';

const ListOfMessages = () => {
  const { user, userProfile } = useUser();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [filteredConvos, setFilteredConvos] = useState<any[]>([]);
  type Conversation = {
    id: string;
    name: string;
    lastMessage: string;
    otherUserId?: string;
  };
  const [selectedItem, setSelectedItem] = useState<Conversation | null>(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const { colors } = useTheme();

  // Subscribe to user's conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(
      user.uid,
      (userConversations: any) => {
        setConversations(userConversations);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    //this will apply the search filter
    const filtered = conversations.filter((convo) =>
      convo.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredConvos(filtered);
  }, [search, conversations]);

  const handleSelectFriend = async (friend: any) => {
    if (!user || !userProfile) return;

    try {
      // Create conversation with the selected friend
      const conversationId = await createConversation(
        user.uid,
        friend.id || friend.uid,
        userProfile.displayName || user.email || 'Unknown',
        friend.name || friend.displayName || 'Unknown'
      );

      // Create conversation object for UI
      const newConvo = {
        id: conversationId,
        name: friend.name || friend.displayName || 'Unknown',
        lastMessage: 'Start your conversation...',
        otherUserId: friend.id || friend.uid,
      };

      // Open the conversation
      setSelectedItem(newConvo);
      setShowNewMessageModal(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // search bar and conversation list
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TextInput
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.card,
              color: colors.text,
            },
          ]}
          placeholder="Search Messages"
          placeholderTextColor={colors.text + '99'}
          value={search}
          onChangeText={setSearch}
        />
        <Pressable
          style={[
            styles.plusButton,
            { backgroundColor: (colors as any).accent },
          ]}
          onPress={() => setShowNewMessageModal(true)}
        >
          <Ionicons name="add" size={25} color={colors.background} />
        </Pressable>
      </View>
      <FlatList
        data={filteredConvos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.convoItem,
              {
                borderBottomColor: colors.card,
                backgroundColor: 'transparent',
              },
            ]}
            onPress={() => setSelectedItem(item)}
          >
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: (colors as any).accent },
              ]}
            >
              <Text style={[styles.avatarText, { color: colors.background }]}>
                {item.name[0]}
              </Text>
            </View>
            <View style={styles.convoText}>
              <Text style={[styles.convoName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.convoLast, { color: colors.text + '99' }]}>
                {item.lastMessage || 'No messages yet'}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.text + '99' }]}>
              No conversations found.
            </Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
      {selectedItem && (
        <MessagesConvo
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          conversationId={selectedItem.id}
        />
      )}

      <NewMessageModal
        visible={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onSelectFriend={handleSelectFriend}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 12,
  },
  plusButton: {
    borderRadius: 20,
    padding: 4,
    elevation: 2,
  },
  convoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  convoText: {
    flex: 1,
  },
  convoName: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
  },
  convoLast: {
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ListOfMessages;
