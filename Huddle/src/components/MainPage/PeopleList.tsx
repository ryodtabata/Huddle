import React, { useState } from 'react';
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

export type Person = {
  id: string;
  name: string;
  age: number;
  bio: string;
  distance: string;
  imageUrl: string;
  verified: boolean;
  tags: string[];
};

interface PeopleListProps {
  people: Person[];
  loading?: boolean;
  showAsFriends?: boolean;
  onMessage?: (person: Person) => void;
  showSearch?: boolean;
  showDistance?: boolean;
  emptyMessage?: string;
}

export function PeopleList({
  people,
  loading = false,
  showAsFriends = false,
  onMessage,
  showSearch = true,
  showDistance = true,
  emptyMessage = 'No people found',
}: PeopleListProps) {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [search, setSearch] = useState('');

  const filteredPeople = people.filter(
    (person) =>
      person.name.toLowerCase().includes(search.toLowerCase()) ||
      person.bio.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {showSearch && (
        <TextInput
          style={styles.searchBar}
          placeholder="Search people..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      )}

      {loading ? (
        <ActivityIndicator
          color="#4fc3f7"
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : filteredPeople.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyMessage}>{emptyMessage}</Text>
        </View>
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
                {showDistance && (
                  <Text style={styles.personDistance}>
                    {item.distance} away
                  </Text>
                )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyMessage: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
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
});
