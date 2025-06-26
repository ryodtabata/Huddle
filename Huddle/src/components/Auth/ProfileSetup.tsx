import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

interface ProfileSetupProps {
  onComplete: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [profileImage, setProfileImage] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [interests, setInterests] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const predefinedAvatars = [
    "https://i.pravatar.cc/250?img=1",
    "https://i.pravatar.cc/250?img=2",
    "https://i.pravatar.cc/250?img=3",
    "https://i.pravatar.cc/250?img=4",
    "https://i.pravatar.cc/250?img=5",
    "https://i.pravatar.cc/250?img=6",
  ];

  const handleSaveProfile = async () => {
    if (!bio.trim() || !age.trim()) {
      Alert.alert("Error", "Please fill in your bio and age");
      return;
    }

    if (isNaN(parseInt(age)) || parseInt(age) < 13 || parseInt(age) > 120) {
      Alert.alert("Error", "Please enter a valid age");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement profile save to backend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success", "Profile created successfully!", [
        { text: "OK", onPress: onComplete },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Profile Setup?",
      "You can always complete your profile later in settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Skip", onPress: onComplete },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Set Up Your Profile</Text>
          <Text style={styles.subtitle}>Let others get to know you better</Text>
        </View>

        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <View style={styles.currentAvatar}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Ionicons name="person" size={40} color="#888" />
              </View>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.avatarGrid}
          >
            {predefinedAvatars.map((avatar, index) => (
              <Pressable
                key={index}
                style={[
                  styles.avatarOption,
                  profileImage === avatar && styles.selectedAvatar,
                ]}
                onPress={() => setProfileImage(avatar)}
              >
                <Image
                  source={{ uri: avatar }}
                  style={styles.avatarOptionImage}
                />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor="#888"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#888"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              maxLength={150}
            />
            <Text style={styles.characterCount}>{bio.length}/150</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Interests (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. #hiking #photography #music"
              placeholderTextColor="#888"
              value={interests}
              onChangeText={setInterests}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSaveProfile}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Saving..." : "Complete Profile"}
            </Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181c24",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#b0b0b0",
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  currentAvatar: {
    marginBottom: 20,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#4fc3f7",
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#232a36",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#888",
    borderStyle: "dashed",
  },
  avatarGrid: {
    maxHeight: 80,
  },
  avatarOption: {
    marginHorizontal: 8,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedAvatar: {
    borderColor: "#4fc3f7",
  },
  avatarOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#232a36",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  characterCount: {
    textAlign: "right",
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#4fc3f7",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipButtonText: {
    color: "#b0b0b0",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
