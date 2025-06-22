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

//probably need to debounce the search input for performance eventually
//need to edit how long a message can be before we cut off

const ListOfMessages = () => {
  // mock conversations for now
  const mockConversations = [
    {
      id: '1',
      name: 'Ally the booke Grainger',
      lastMessage: 'Hey,',
    },
    { id: '2', name: 'Bob', lastMessage: "Let's catch up soon!" },
    { id: '3', name: 'Charlie', lastMessage: 'Check out this link.' },
    {
      id: '4',
      name: 'Ally the booke Grainger',
      lastMessage: 'Hey, how are you?',
    },
    { id: '5', name: 'Bob', lastMessage: "Let's catch up soon!" },
    { id: '6', name: 'Charlie', lastMessage: 'Check out this link.' },
    {
      id: '7',
      name: 'Ally the booke Grainger',
      lastMessage: 'Hey, how are you?',
    },
    {
      id: '8',
      name: 'Bob',
      lastMessage: "Let's catch asdsadasdasdasdasadasdup soon!",
    },
    { id: '9', name: 'Charlie', lastMessage: 'Check out this link.' },
    {
      id: '10',
      name: 'Ally the booke Grainger',
      lastMessage: 'Hey, how are you?',
    },
    { id: '11', name: 'Bob', lastMessage: "Let's catch up soon!" },
    { id: '12', name: 'Charlie', lastMessage: 'Check out this link.' },
  ];

  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState(mockConversations);
  const [filteredConvos, setFilteredConvos] = useState(mockConversations);
  type Conversation = { id: string; name: string; lastMessage: string };
  const [selectedItem, setSelectedItem] = useState<Conversation | null>(null);

  useEffect(() => {
    //this will apply the search filter
    const filtered = conversations.filter((convo) =>
      convo.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredConvos(filtered);
  }, [search, conversations]);

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
          onPress={() => alert('New message')}
        >
          <Ionicons name="add" size={25} color="#4fc3f7" />
        </Pressable>
      </View>
      {/*will eventuiallt send a messages array i guess, FIREBA */}
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
              <Text style={styles.convoLast}>{item.lastMessage}</Text>
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
          messages={[
            {
              id: 1,
              sender: 'Alice',
              text: 'Hello!',
              time: '10:00 AM',
            },
          ]}
          currentUser="Me"
        />
      )}
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
