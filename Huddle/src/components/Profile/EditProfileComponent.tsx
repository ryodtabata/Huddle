import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../store/UserContext';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/configFirebase';

const EditProfileComponent = () => {
  const navigation = useNavigation<any>();
  const { user, userProfile, refreshUserProfile } = useUser();

  // Initialize state with user data
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [hideAge, setHideAge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get age from userProfile or default
  const lockedAge = userProfile?.age || 0;

  // Load user data when component mounts
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.displayName || user?.displayName || '');
      setBio(userProfile.bio || '');
      setHashtags(userProfile.interests || '');
      setHideAge(userProfile.hideAge || false);
    } else if (user) {
      // If no profile exists, use basic auth data
      setName(user.displayName || user.email?.split('@')[0] || '');
    }
  }, [userProfile, user]);

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the data to update
      const updateData: {
        displayName: string;
        bio: string;
        interests: string;
        hideAge: boolean;
        email: string | null;
        uid: string;
        updatedAt: Date;
        age?: number;
        createdAt?: Date;
      } = {
        displayName: name.trim(),
        bio: bio.trim(),
        interests: hashtags.trim(),
        hideAge: hideAge,
        email: user.email,
        uid: user.uid,
        updatedAt: new Date(),
      };

      // Always include age and createdAt for new profiles
      if (!userProfile || !userProfile.age) {
        updateData.age = lockedAge || 18; // Default age if not set
      }

      if (!userProfile || !userProfile.createdAt) {
        updateData.createdAt = new Date();
      }

      // Update user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);

      // Always use setDoc with merge: true to handle both create and update
      await setDoc(userDocRef, updateData, { merge: true });

      // Refresh user profile in context
      await refreshUserProfile();

      Alert.alert('Success', 'Your profile has been updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
          style: 'default',
        },
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.', [
        { text: 'OK', style: 'default' },
      ]);
    } finally {
      setIsLoading(false);
    }
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
            value={lockedAge ? `${lockedAge} years old` : 'Not set'}
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
                trackColor={{ false: '#3a4149', true: '#4fc3f7' }}
                thumbColor={hideAge ? '#fff' : '#ccc'}
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
                .split(' ')
                .filter((tag) => tag.startsWith('#') && tag.length > 1)
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
            {
              backgroundColor: pressed ? '#29b6f6' : '#4fc3f7',
              opacity: isLoading ? 0.7 : 1,
            },
          ]}
          onPress={handleSaveChanges}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.saveButtonText}>Saving...</Text>
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ... existing styles remain the same ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181c24',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#232a36',
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
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockedText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#232a36',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#3a4149',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  lockedInput: {
    backgroundColor: '#1a1f26',
    color: '#666',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#232a36',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a4149',
  },
  toggleSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  hashtagPreview: {
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4fc3f7',
    marginBottom: 8,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagTag: {
    backgroundColor: '#4fc3f7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hashtagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    elevation: 2,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
  },
});

export default EditProfileComponent;
