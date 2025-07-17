import React, { useState, useEffect } from 'react';
import { getNearbyUsers } from '../../firebase/geoService';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ProfileModal } from '../Profile/ProfileModal';
import { useUser } from '../../store/UserContext';

type Person = {
  id: string;
  name: string;
  age: number;
  bio: string;
  distance: string;
  imageUrl: string;
  verified: boolean;
  tags: string[];
};

interface ListofPeopleProps {
  showAsFriends?: boolean;
  onMessage?: (person: Person) => void;
}

export function ListofPeople({
  showAsFriends = false,
  onMessage,
}: ListofPeopleProps) {
  const { userProfile } = useUser(); // <-- Get userProfile from context
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [search, setSearch] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchPeople = async () => {
      console.log('Fetching nearby users... with location:', {
        latitude: userProfile?.location?.latitude,
        longitude: userProfile?.location?.longitude,
      });
      if (
        !userProfile?.location?.latitude ||
        !userProfile?.location?.longitude
      ) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const users = await getNearbyUsers(
          userProfile.location.latitude,
          userProfile.location.longitude,
          10000000, //maxing this out right now for dev reasons
          userProfile.uid // <-- Pass the actual user ID, not true/null
        );
        const mapped = users.map((u: any) => ({
          id: u.uid,
          name: u.displayName || 'Unknown',
          age: u.age || 0,
          bio: u.bio || '',
          distance: u.distance ? `${u.distance.toFixed(1)} km` : '',
          imageUrl: u.profileImage || 'https://i.pravatar.cc/150?u=' + u.uid,
          verified: u.verified || false,
          tags: u.tags || [],
        }));
        setPeople(mapped);
        console.log('Fetched people:', mapped);
      } catch (e) {
        setPeople([]);
      }
      setLoading(false);
    };

    fetchPeople();
    intervalId = setInterval(fetchPeople, 300000); // changing how often we fetch users to every 5 minutes

    return () => clearInterval(intervalId);
  }, [userProfile?.location?.latitude, userProfile?.location?.longitude]);

  const filteredPeople = people.filter(
    (person) =>
      person.name.toLowerCase().includes(search.toLowerCase()) ||
      person.bio.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search people..."
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator
          color="#4fc3f7"
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredPeople}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.personItem,
                pressed && { backgroundColor: '#263043' },
              ]}
              onPress={() => setSelectedPerson(item)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
              <View style={styles.info}>
                <Text style={styles.personName}>
                  {item.name}, <Text style={styles.personAge}>{item.age}</Text>
                </Text>
                <Text style={styles.personDistance}>{item.distance} away</Text>
                <Text style={styles.personBio} numberOfLines={1}>
                  {item.bio}
                </Text>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      <ProfileModal
        visible={!!selectedPerson}
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        isFriend={showAsFriends}
        onMessage={onMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181c24',
    padding: 16,
  },
  searchBar: {
    backgroundColor: '#232a36',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    marginBottom: 14,
  },
  personItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232a36',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#4fc3f7',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  personName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  personAge: {
    color: '#b0b0b0',
    fontWeight: 'normal',
    fontSize: 16,
  },
  personDistance: {
    color: '#4fc3f7',
    fontSize: 14,
    marginTop: 2,
  },
  personBio: {
    color: '#b0b0b0',
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: 12,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(24,28,36,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '94%',
    backgroundColor: 'transparent',
    borderRadius: 20,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: '#4fc3f7',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
