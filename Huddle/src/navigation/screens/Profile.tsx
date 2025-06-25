import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProfileCard } from "../../components/Profile/ProfileCard";
import { useNavigation } from "@react-navigation/native";

type NavigationProp = {
  navigate: (screen: string) => void;
};

// profile screen component
// this will be the profile screen where users can see their profile and edit it
// to do: add functionality to edit profile, view friends, and settings
// choose a different colour maybe,,, lime ghreen?
export function Profile() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.actionRow}>
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={22} color="#4fc3f7" />
          <Text style={styles.iconButtonText}>Settings</Text>
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.navigate("Friends")}
        >
          <Ionicons name="people-outline" size={22} color="#4fc3f7" />
          <Text style={styles.iconButtonText}>Friends</Text>
        </Pressable>
      </View>
      <ProfileCard
        name="Ryo Demetrius Tabata"
        age={24}
        bio="Avid traveler and tech enthusiast. Owner of said app:)"
        distance="Nearby"
        imageUrl="https://i.pravatar.cc/250?u=mail@ashallendesign.co.uk"
        verified={true}
        tags={["#chess", "#coding", "#music", "#dancing"]}
      />
      <Pressable
        onPress={() => navigation.navigate("EditProfile")}
        style={({ pressed }) => [
          styles.editButton,
          { backgroundColor: pressed ? "#29b6f6" : "#4fc3f7" },
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
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#181c24",
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 12,
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    elevation: 2,
    marginHorizontal: 4,
  },
  iconButtonText: {
    color: "#4fc3f7",
    fontWeight: "bold",
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
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});
