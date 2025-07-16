import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { subscribeToPublicMessages, sendPublicMessage } from "../../firebase/publicChatService";
import { useUser } from "../../store/UserContext";

const PublicChatConvo = (props: any) => {
  const { chat, onClose } = props;
  const [input, setInput] = useState("");
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useUser();

  useEffect(() => {
    if (!chat?.id) return;

    // Subscribe to messages
    const unsubscribe = subscribeToPublicMessages(chat.id, (messages: any) => {
      setAllMessages(messages);
    });

    return () => unsubscribe();
  }, [chat?.id]);

  useEffect(() => {
    if (flatListRef.current && allMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [allMessages]);

  const handleSend = async () => {
    if (input.trim() === "" || !chat?.id || !user || !userProfile) return;
    
    setLoading(true);
    try {
      await sendPublicMessage(
        chat.id,
        user.uid,
        userProfile.displayName || user.email || "Unknown",
        input.trim()
      );
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!chat) return null;

  return (
    <Modal visible={!!chat} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View style={[styles.headerBar, { paddingTop: insets.top }]}>
            <Pressable style={styles.backButton} onPress={onClose}>
              <Ionicons name="chevron-back" size={28} color="#4fc3f7" />
            </Pressable>
            <View style={styles.headerInfo}>
              <Text style={styles.headerText}>{chat.name}</Text>
              <Text style={styles.headerSubtext}>
                {chat.participantCount} people nearby
              </Text>
            </View>
            <Ionicons name="location" size={24} color="#4fc3f7" />
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={allMessages}
            keyExtractor={(msg) =>
              msg.id?.toString() ?? Math.random().toString()
            }
            renderItem={({ item: msg }) => (
              <View
                style={[
                  styles.messageBubble,
                  msg.senderId === user?.uid
                    ? styles.myMessage
                    : styles.otherMessage,
                ]}
              >
                {msg.senderId !== user?.uid && (
                  <Text style={styles.sender}>{msg.sender}</Text>
                )}
                <Text
                  style={[
                    styles.messageText,
                    msg.senderId === user?.uid && { color: "#fff" },
                  ]}
                >
                  {msg.text}
                </Text>
                <Text style={styles.time}>{msg.time}</Text>
              </View>
            )}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Ionicons name="chatbubbles-outline" size={48} color="#666" />
                <Text style={styles.emptyText}>
                  No messages yet. Be the first to say hello!
                </Text>
              </View>
            }
          />

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Message everyone nearby..."
              placeholderTextColor="#888"
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
            <Pressable 
              style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
              onPress={handleSend}
              disabled={loading}
            >
              <Ionicons name="arrow-up" size={22} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#181c24",
  },
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#181c24",
    flex: 1,
  },
  headerBar: {
    height: 56,
    backgroundColor: "#2a2f3a",
    borderBottomWidth: 1,
    borderBottomColor: "#3a3f4a",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerText: {
    fontWeight: "600",
    fontSize: 18,
    color: "#fff",
  },
  headerSubtext: {
    fontSize: 12,
    color: "#4fc3f7",
  },
  messagesList: {
    padding: 12,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4fc3f7",
    borderBottomRightRadius: 6,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#2a2f3a",
    borderBottomLeftRadius: 6,
  },
  sender: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4fc3f7",
    marginBottom: 2,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
    textAlign: "right",
    alignSelf: "flex-end",
  },
  emptyMessages: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#3a3f4a",
    padding: 10,
    backgroundColor: "#2a2f3a",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3a3f4a",
    fontSize: 16,
    backgroundColor: "#181c24",
    marginRight: 8,
    color: "#fff",
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#4fc3f7",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default PublicChatConvo;
