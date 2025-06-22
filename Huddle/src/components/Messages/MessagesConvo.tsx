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
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const MessagesConvo = (props: any) => {
  const { item, onClose, messages = [], currentUser = 'Me' } = props;
  const [input, setInput] = useState('');
  const [allMessages, setAllMessages] = useState(messages);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setAllMessages(messages);
  }, [item, messages]);

  useEffect(() => {
    if (flatListRef.current && allMessages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [allMessages]);

  const handleSend = () => {
    if (input.trim() === '') return;
    setAllMessages([
      ...allMessages,
      {
        id: allMessages.length + 1,
        sender: currentUser,
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
    setInput('');
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
          <View style={styles.headerBar}>
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
                  msg.sender === currentUser
                    ? styles.myMessage
                    : styles.otherMessage,
                ]}
              >
                {msg.sender !== currentUser && (
                  <Text style={styles.sender}>{msg.sender}</Text>
                )}
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === currentUser && { color: '#fff' },
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
            <Pressable style={styles.sendButton} onPress={handleSend}>
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
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
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
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
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
});

export default MessagesConvo;
