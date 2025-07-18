import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FriendsList } from '../../components/Friends/FriendsList';
import { Person } from '../../components/MainPage/PeopleList';

export function Friends() {
  const navigation = useNavigation<any>();

  const handleMessage = (person: Person) => {
    Alert.alert('Message', `Opening chat with ${person.name}...`);
    // navigation.navigate('Messages', { person });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4fc3f7" />
        </Pressable>
        <Text style={styles.title}>Friends</Text>
      </View>

      <FriendsList onMessage={handleMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181c24',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#232a36',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});
