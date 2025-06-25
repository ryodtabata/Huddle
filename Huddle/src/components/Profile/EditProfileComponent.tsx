import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const EditProfileComponent = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState("Ryo Demetrius Tabata");
  const [bio, setBio] = useState(
    "Avid traveler and tech enthusiast. Owner of said app:)"
  );
  const [hashtags, setHashtags] = useState("#chess #coding #music #dancing");
  const [hideAge, setHideAge] = useState(false);
  const lockedAge = 24; // Age is locked and cannot be edited

  const handleSaveChanges = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    Alert.alert(
      "Profile Updated",
      "Your profile has been updated successfully!",
      [{ text: "OK", style: "default" }]
    );
  };

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    maxLength,
    locked = false,
    lockMessage,
  }: {
    label: string;
    value: string;
    onChangeText?: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    maxLength?: number;
    locked?: boolean;
    lockMessage?: string;
  }) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {locked && (
          <View style={styles.lockedContainer}>
            <Ionicons name="lock-closed" size={16} color="#999" />
            <Text style={styles.lockedText}>{lockMessage}</Text>
          </View>
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          locked && styles.lockedInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        maxLength={maxLength}
        editable={!locked}
      />
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4fc3f7" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your profile information</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <InputField
            label="Display Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your display name"
            maxLength={50}
          />

          <InputField
            label="Age"
            value={`${lockedAge} years old`}
            placeholder="Age"
            locked={true}
            lockMessage="Age cannot be changed"
          />

          <View style={styles.inputContainer}>
            <View style={styles.toggleContainer}>
              <View>
                <Text style={styles.label}>Age Visibility</Text>
                <Text style={styles.toggleSubtext}>
                  Hide your age from other users
                </Text>
              </View>
              <Switch
                value={hideAge}
                onValueChange={setHideAge}
                trackColor={{ false: "#3a4149", true: "#4fc3f7" }}
                thumbColor={hideAge ? "#fff" : "#ccc"}
              />
            </View>
          </View>

          <InputField
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others about yourself..."
            multiline={true}
            maxLength={200}
          />

          <InputField
            label="Hashtags"
            value={hashtags}
            onChangeText={setHashtags}
            placeholder="Add hashtags separated by spaces (e.g., #music #travel)"
            maxLength={100}
          />

          <View style={styles.hashtagPreview}>
            <Text style={styles.previewLabel}>Hashtag Preview:</Text>
            <View style={styles.hashtagContainer}>
              {hashtags
                .split(" ")
                .filter((tag) => tag.startsWith("#") && tag.length > 1)
                .map((tag, index) => (
                  <View key={index} style={styles.hashtagTag}>
                    <Text style={styles.hashtagText}>{tag}</Text>
                  </View>
                ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: pressed ? "#29b6f6" : "#4fc3f7" },
          ]}
          onPress={handleSaveChanges}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => Alert.alert("Changes discarded")}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#181c24",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#232a36",
  },
  backButton: {
    marginRight: 16,
    marginTop: 4,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  lockedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  lockedText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#232a36",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#3a4149",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  lockedInput: {
    backgroundColor: "#1a1f26",
    color: "#666",
  },
  characterCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#232a36",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3a4149",
  },
  toggleSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  hashtagPreview: {
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4fc3f7",
    marginBottom: 8,
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  hashtagTag: {
    backgroundColor: "#4fc3f7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hashtagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 24,
    elevation: 2,
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 16,
  },
});

export default EditProfileComponent;
