import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileCard } from '../../components/Profile/ProfileCard';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../store/UserContext';

type NavigationProp = {
  navigate: (screen: string) => void;
};

export function Profile() {
  const navigation = useNavigation<any>();
  const { user, userProfile, loading } = useUser();

  //lading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  //fallabck if user does not have a profile set up
  const displayName =
    userProfile?.displayName || user?.displayName || 'Unknown User';
  const displayAge = userProfile?.age || 0;
  const displayBio = userProfile?.bio || 'No bio available';
  const displayImage =
    userProfile?.profileImage || 'https://i.pravatar.cc/250?u=default';
  const displayInterests = userProfile?.interests
    ? userProfile.interests.split(',').map((interest) => `#${interest.trim()}`)
    : ['#newuser'];

  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#4fc3f7" />
          <Text style={styles.iconButtonText}>Settings</Text>
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate('Friends')}
        >
          <Ionicons name="people-outline" size={22} color="#4fc3f7" />
          <Text style={styles.iconButtonText}>Friends</Text>
        </Pressable>
      </View>

      <ProfileCard
        name={displayName}
        age={displayAge}
        bio={displayBio}
        distance="Nearby"
        imageUrl={displayImage}
        verified={true}
        tags={displayInterests}
      />

      <Pressable
        onPress={() => navigation.navigate('EditProfile')}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
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
