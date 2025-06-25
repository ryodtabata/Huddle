import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfileCardProps {
  name: string;
  age: number;
  bio: string;
  distance: string;
  imageUrl: string;
  verified?: boolean;
  tags?: string[];
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  age,
  bio,
  distance,
  imageUrl,
  verified = false,
}) => (
  <View style={styles.container}>
    <View style={styles.avatarContainer}>
      <Image source={{ uri: imageUrl }} style={styles.avatar} />
      {verified && (
        <View style={styles.verifiedIcon}>
          <Ionicons name="checkmark-circle" size={32} color="#4fc3f7" />
        </View>
      )}
    </View>
    <Text style={styles.name}>
      {name}, <Text style={styles.age}>{age}</Text>
    </Text>
    <Text style={styles.distance}>{distance}</Text>
    <View style={styles.bioContainer}>
      <Text style={styles.bio}>{bio}</Text>
    </View>
    <View style={styles.tags}>
      <Text style={styles.tag}>#anime</Text>
      <Text style={styles.tag}>#coding</Text>
      <Text style={styles.tag}>#music</Text>
    </View>
  </View>
);

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: 550,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    width: width * 0.9,
  },
  avatarContainer: {
    position: "relative",
    width: 225,
    height: 225,
    marginBottom: 8,
    marginTop: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 225,
    height: 225,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  verifiedIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    marginBottom: 2,
  },
  age: {
    fontWeight: "400",
    color: "#888",
  },
  distance: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  bioContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
    width: "100%",

    elevation: 2,
  },
  bio: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  tags: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 0,
  },
  tag: {
    backgroundColor: "#eee",
    color: "#444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
});
