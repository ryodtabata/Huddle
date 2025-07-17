import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { ListofPeople } from '../../components/MainPage/ListofPeople';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export function Friends() {
  const navigation = useNavigation<any>();

  const handleMessage = (person: any) => {
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
        <Text style={styles.title}>Friends List</Text>
      </View>
      <ListofPeople showAsFriends={true} onMessage={handleMessage} />
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
