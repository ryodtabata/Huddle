import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PublicChatsPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Public Chats</Text>
      <Text style={styles.subtitle}>This is the public chats page.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181c24',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
});

export default PublicChatsPage;
