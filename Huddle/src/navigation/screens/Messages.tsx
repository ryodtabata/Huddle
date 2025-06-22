import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockConversations = [
  {
    id: '1',
    name: 'Ally the booke Grainger',
    lastMessage: 'Hey, how are you?',
  },
  { id: '2', name: 'Bob', lastMessage: "Let's catch up soon!" },
  { id: '3', name: 'Charlie', lastMessage: 'Check out this link.' },
];

export function Messages() {
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState(mockConversations);

  const filteredConvos = conversations.filter(
    (convo) =>
      convo.name.toLowerCase().includes(search.toLowerCase()) ||
      convo.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header with search and plus button */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
        <Pressable
          style={styles.plusButton}
          onPress={() => console.log('New message')}
        >
          <Ionicons name="add" size={25} color="#4fc3f7" />
        </Pressable>
      </View>
      {/* Conversation list */}
      <FlatList
        data={filteredConvos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.convoItem}
            onPress={() => console.log('Open convo', item.name)}
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
    </View>
  );
}

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
