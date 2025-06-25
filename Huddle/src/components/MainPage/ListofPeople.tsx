import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  Image,
  TextInput,
} from "react-native";
import { ProfileCard } from "../Profile/ProfileCard";

const mockPeople = [
  {
    id: "1",
    name: "Alice Smith",
    age: 25,
    bio: "Loves hiking and photography.",
    distance: "0.5 miles",
    imageUrl: "https://i.pravatar.cc/250?img=1",
    verified: true,
    tags: ["#hiking", "#photography", "#travel"],
  },
  {
    id: "2",
    name: "Bob Johnson",
    age: 30,
    bio: "Coffee enthusiast and coder.",
    distance: "1 mile",
    imageUrl: "https://i.pravatar.cc/250?img=2",
    verified: false,
    tags: ["#coffee", "#coding", "#music"],
  },
  {
    id: "3",
    name: "Carol Lee",
    age: 27,
    bio: "Runner and foodie.",
    distance: "2 miles",
    imageUrl: "https://i.pravatar.cc/250?img=3",
    verified: true,
    tags: ["#running", "#food", "#anime"],
  },
];

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

export function ListofPeople() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [search, setSearch] = useState("");

  const filteredPeople = mockPeople.filter(
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
      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.personItem,
              pressed && { backgroundColor: "#263043" },
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

      <Modal
        visible={!!selectedPerson}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPerson(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {selectedPerson && (
              <ProfileCard
                name={selectedPerson.name}
                age={selectedPerson.age}
                bio={selectedPerson.bio}
                distance={selectedPerson.distance}
                imageUrl={selectedPerson.imageUrl}
                verified={selectedPerson.verified}
                tags={selectedPerson.tags}
              />
            )}
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedPerson(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181c24",
    padding: 16,
  },
  searchBar: {
    backgroundColor: "#232a36",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 16,
    marginBottom: 14,
  },
  personItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#232a36",
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
    borderColor: "#4fc3f7",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  personName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  personAge: {
    color: "#b0b0b0",
    fontWeight: "normal",
    fontSize: 16,
  },
  personDistance: {
    color: "#4fc3f7",
    fontSize: 14,
    marginTop: 2,
  },
  personBio: {
    color: "#b0b0b0",
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: 12,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(24,28,36,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "94%",
    backgroundColor: "transparent",
    borderRadius: 20,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 18,
    backgroundColor: "#4fc3f7",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 20,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
