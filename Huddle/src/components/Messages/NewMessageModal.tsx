import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

// Mock friends data - in a real app this would come from your state/API
const mockFriends = [
  {
    id: "1",
    name: "Alice Smith",
    imageUrl: "https://i.pravatar.cc/250?img=1",
    hasActiveConvo: true, // This friend already has an active conversation
  },
  {
    id: "2",
    name: "Bob Johnson",
    imageUrl: "https://i.pravatar.cc/250?img=2",
    hasActiveConvo: false,
  },
  {
    id: "3",
    name: "Carol Lee",
    imageUrl: "https://i.pravatar.cc/250?img=3",
    hasActiveConvo: false,
  },
  {
    id: "4",
    name: "David Wilson",
    imageUrl: "https://i.pravatar.cc/250?img=4",
    hasActiveConvo: false,
  },
  {
    id: "5",
    name: "Emma Davis",
    imageUrl: "https://i.pravatar.cc/250?img=5",
    hasActiveConvo: true,
  },
];

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
  const [search, setSearch] = useState("");
  const [filteredFriends, setFilteredFriends] = useState(mockFriends);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const filtered = mockFriends.filter((friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFriends(filtered);
  }, [search]);

  const handleSelectFriend = (friend: Friend) => {
    onSelectFriend(friend);
    setSearch("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#4fc3f7" />
          </Pressable>
          <Text style={styles.headerTitle}>New Message</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search friends..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Friends List */}
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={styles.friendItem}
              onPress={() => handleSelectFriend(item)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.name}</Text>
                <Text style={styles.friendStatus}>
                  {item.hasActiveConvo
                    ? "Active conversation"
                    : "Start new chat"}
                </Text>
              </View>
              <Ionicons
                name={item.hasActiveConvo ? "chatbubble" : "add-circle-outline"}
                size={20}
                color="#4fc3f7"
              />
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No friends found.</Text>
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
    backgroundColor: "#181c24",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#232a36",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    backgroundColor: "#232a36",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 16,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#232a36",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#4fc3f7",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  friendStatus: {
    color: "#b0b0b0",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
});
