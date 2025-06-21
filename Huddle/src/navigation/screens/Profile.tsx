import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileCard } from '../../components/Profile/ProfileCard';

export function Profile() {
  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <Pressable style={styles.iconButton} onPress={() => alert('Settings')}>
          <Ionicons name="settings-outline" size={22} color="#4fc3f7" />
          <Text style={styles.iconButtonText}>Settings</Text>
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => alert('Friends')}>
          <Ionicons name="people-outline" size={22} color="#4fc3f7" />
          <Text style={styles.iconButtonText}>Friends</Text>
        </Pressable>
      </View>
      <ProfileCard
        name="John Doe"
        age={28}
        bio="Avid traveler and tech enthusiast."
        distance="Nearby"
        imageUrl="https://i.pravatar.cc/250?u=mail@ashallendesign.co.uk"
        verified={true}
        tags={['#anime', '#coding', '#music']}
      />
      <Pressable
        onPress={() => alert('Edit Profile Pressed')}
        style={({ pressed }) => [
          styles.editButton,
          { backgroundColor: pressed ? '#29b6f6' : '#4fc3f7' },
        ]}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#181c24',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 12,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    elevation: 2,
    marginHorizontal: 4,
  },
  iconButtonText: {
    color: '#4fc3f7',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 10,
    elevation: 2,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
