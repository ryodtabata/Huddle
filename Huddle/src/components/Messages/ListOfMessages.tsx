import React, { use, useState, useEffect } from 'react';
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Messages"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        <Pressable
          style={styles.plusButton}
          onPress={() => setShowNewMessageModal(true)}
        >
          <Ionicons name="add" size={25} color="#4fc3f7" />
        </Pressable>
      </View>
      {/*will eventuially send a messages array i guess, FIREBA */}
      <FlatList
        data={filteredConvos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.convoItem}
            onPress={() => setSelectedItem(item)} // Navigate to conversation
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={styles.convoText}>
              <Text style={styles.convoName}>{item.name}</Text>
              <Text style={styles.convoLast}>
                {item.lastMessage || 'No messages yet'}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations found.</Text>
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
    backgroundColor: '#181c24',
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
    backgroundColor: '#232a36',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 16,
    marginRight: 12,
  },
  plusButton: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#232a36',
    backgroundColor: 'transparent',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4fc3f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  convoText: {
    flex: 1,
  },
  convoName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
  },
  convoLast: {
    color: '#b0b0b0',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default ListOfMessages;
