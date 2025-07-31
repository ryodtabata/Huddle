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
  subscribeToPublicMessages,
  sendPublicMessage,
} from '../../firebase/publicChatService';
import { useUser } from '../../store/UserContext';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PublicChatConvo = (props: any) => {
  const { chat, onClose } = props;
  const [input, setInput] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const { user, userProfile } = useUser();
  const { colors } = useTheme();

  useEffect(() => {
    if (!chat?.id) return;
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
    if (input.trim() === '' || !chat?.id || !user || !userProfile) return;
    setLoading(true);
    try {
      await sendPublicMessage(
        chat.id,
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

  if (!chat) return null;

  return (
    <Modal visible={!!chat} onRequestClose={onClose} animationType="slide">
      <View
        style={[
          styles.overlay,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View
            style={[
              styles.headerBar,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border || colors.card,
              },
            ]}
          >
            <Pressable style={styles.backButton} onPress={onClose}>
              <Ionicons
                name="chevron-back"
                size={28}
                color={(colors as any).accent}
              />
            </Pressable>
            <View style={styles.headerInfo}>
              <Text style={[styles.headerText, { color: colors.text }]}>
                {chat.name}
              </Text>
              <Text
                style={[
                  styles.headerSubtext,
                  { color: (colors as any).accent },
                ]}
              >
                {chat.participantCount} people nearby
              </Text>
            </View>
            <Ionicons
              name="location"
              size={24}
              color={(colors as any).accent}
            />
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
                  {
                    alignSelf:
                      msg.senderId === user?.uid ? 'flex-end' : 'flex-start',
                    backgroundColor:
                      msg.senderId === user?.uid
                        ? (colors as any).accent
                        : colors.card,
                  },
                ]}
              >
                {msg.senderId !== user?.uid && (
                  <Text
                    style={[styles.sender, { color: (colors as any).accent }]}
                  >
                    {msg.sender}
                  </Text>
                )}
                <Text
                  style={[
                    styles.messageText,
                    {
                      color:
                        msg.senderId === user?.uid
                          ? colors.background
                          : colors.text,
                    },
                  ]}
                >
                  {msg.text}
                </Text>
                <Text style={[styles.time, { color: colors.text + '99' }]}>
                  {msg.time}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.messagesList}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={48}
                  color={colors.text + '66'}
                />
                <Text style={[styles.emptyText, { color: colors.text + '99' }]}>
                  No messages yet. Be the first to say hello!
                </Text>
              </View>
            }
            style={{ flex: 1, width: '100%' }}
          />

          {/* Input */}
          <View
            style={[
              styles.inputRow,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border || colors.card,
                paddingBottom: insets.bottom,
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border || colors.card,
                },
              ]}
              value={input}
              onChangeText={setInput}
              placeholder="Message everyone nearby..."
              placeholderTextColor={colors.text + '99'}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
            <Pressable
              style={[
                styles.sendButton,
                { backgroundColor: (colors as any).accent },
                loading && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={loading}
            >
              <Ionicons name="arrow-up" size={22} color={colors.background} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerText: {
    fontWeight: '600',
    fontSize: 18,
  },
  headerSubtext: {
    fontSize: 12,
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
  },
  sender: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  inputRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    padding: 10,
    alignItems: 'flex-end',
    width: '100%',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 16,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default PublicChatConvo;
