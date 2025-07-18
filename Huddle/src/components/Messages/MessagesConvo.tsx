import React, { useRef, useEffect, useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  subscribeToMessages,
  sendMessage,
  createConversation,
} from '../../firebase/messageService';
import { useUser } from '../../store/UserContext';

const MessagesConvo = (props: any) => {
  const { item, onClose, conversationId: propConversationId } = props;
  const [input, setInput] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    propConversationId || null
  );
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useUser();

  useEffect(() => {
    // Initialize conversation if needed
    const initializeConversation = async () => {
      if (!user || !userProfile || !item) return;

      try {
        if (!conversationId) {
          // Create or get conversation
          const newConversationId = await createConversation(
            user.uid,
            item.id || item.uid,
            userProfile.displayName || user.email || 'Unknown',
            item.name || item.displayName || 'Unknown'
          );
          setConversationId(newConversationId);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        Alert.alert('Error', 'Failed to initialize conversation');
      }
    };

    initializeConversation();
  }, [user, userProfile, item, conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(conversationId, (messages: any) => {
      setAllMessages(messages);
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    if (flatListRef.current && allMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [allMessages]);

  const handleSend = async () => {
    if (input.trim() === '' || !conversationId || !user || !userProfile) return;

    setLoading(true);
    try {
      await sendMessage(
        conversationId,
        user.uid,
        userProfile.displayName || user.email || 'Unknown',
        input.trim()
      );
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal visible={!!item} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.iphoneContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={[styles.headerBar, { paddingTop: insets.top }]}>
            <Pressable style={styles.backButton} onPress={onClose}>
              <Ionicons name="chevron-back" size={28} color="#007aff" />
            </Pressable>
            <Text style={styles.headerText}>{item.name}</Text>
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
                    msg.senderId === user?.uid && { color: '#fff' },
                  ]}
                >
                  {msg.text}
                </Text>
                <Text style={styles.time}>{msg.time}</Text>
              </View>
            )}
            contentContainerStyle={styles.messagesList}
          />
          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Message"
              placeholderTextColor="#888"
              onSubmitEditing={handleSend}
              returnKeyType="send"
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
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iphoneContainer: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    backgroundColor: '#f5f5f7',
    alignSelf: 'center',
    // shadowColor: "#000",
    // shadowOpacity: 0.12,
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 8,
    elevation: 6,
    flex: 1,
  },
  headerBar: {
    height: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerText: {
    fontWeight: '600',
    fontSize: 18,
    color: '#222',
  },
  messagesList: {
    padding: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    marginBottom: 8,
    alignSelf: 'flex-start',
    // shadowColor: "#000",
    // shadowOpacity: 0.04,
    // shadowOffset: { width: 0, height: 1 },
    // shadowRadius: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007aff',
    borderBottomRightRadius: 6,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 6,
  },
  sender: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007aff',
    marginBottom: 2,
  },
  messageText: {
    color: '#222',
    fontSize: 16,
  },
  time: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    backgroundColor: '#f5f5f7',
    marginRight: 8,
    color: '#222',
  },
  sendButton: {
    backgroundColor: '#007aff',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default MessagesConvo;
