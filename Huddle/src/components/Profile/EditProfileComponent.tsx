import React, { useState, useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../store/UserContext';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/configFirebase';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Create a separate memoized component for InputField
const InputField = memo(
  ({
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
  }) => {
    const inputRef = useRef<any>(null);

    return (
      <View style={inputStyles.inputContainer}>
        <View style={inputStyles.labelContainer}>
          <Text style={inputStyles.label}>{label}</Text>
          {locked && (
            <View style={inputStyles.lockedContainer}>
              <Ionicons name="lock-closed" size={16} color="#999" />
              <Text style={inputStyles.lockedText}>{lockMessage}</Text>
            </View>
          )}
        </View>
        <TextInput
          ref={inputRef}
          style={[
            inputStyles.input,
            multiline && inputStyles.textArea,
            locked && inputStyles.lockedInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666"
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          maxLength={maxLength}
          editable={!locked}
          textBreakStrategy="simple"
          keyboardType="default"
        />
        {maxLength && (
          <Text style={inputStyles.characterCount}>
            {(value || '').length}/{maxLength}
          </Text>
        )}
      </View>
    );
  }
);

const inputStyles = StyleSheet.create({
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
});

const EditProfileComponent = () => {
  const navigation = useNavigation<any>();
  const { user, userProfile } = useUser();

  //feilds for profile editing
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [hideAge, setHideAge] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  //once user sets age cannot be changed, but i dont think they get older lmao with time
  const lockedAge = userProfile?.age || 0;

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.displayName || user?.displayName || '');
      setBio(userProfile.bio || '');
      setHashtags(userProfile.interests || '');
      setHideAge(userProfile.hideAge || false);
      setProfileImage(userProfile.profileImage || '');
    }
  }, []);

  //users can now upload their own images!
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission required',
          'Permission to access camera roll is required!'
        );
        return;
      }

      setImageUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      //right now photos look ugly, need to fix later
      if (!result.canceled && result.assets[0]) {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400, height: 400 } }],
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        //now using firebase storage! WOOO
        const downloadURL = await uploadImageToFirebase(manipulatedImage.uri);
        setProfileImage(downloadURL);
        setImageUploading(false);
      } else {
        setImageUploading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      setImageUploading(false);
    }
  };

  const deleteOldProfileImage = async (imageUrl: string) => {
    try {
      if (!imageUrl || !imageUrl.includes('firebase')) {
        return; //since the storage takes up space i want to delete old images
      }

      const storage = getStorage();
      const urlParts = imageUrl.split('/');
      const fileNameWithToken = urlParts[urlParts.length - 1];
      const fileName = fileNameWithToken.split('?')[0];
      const decodedFileName = decodeURIComponent(fileName);

      //ref to old pfp
      const oldImageRef = ref(storage, decodedFileName);

      //delete that bichhhh
      await deleteObject(oldImageRef);
      console.log('Old profile image deleted successfully');
    } catch (error) {
      console.warn('Failed to delete old profile image:', error);
    }
  };

  const uploadImageToFirebase = async (imageUri: string): Promise<string> => {
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }
      //delete old
      if (profileImage) {
        await deleteOldProfileImage(profileImage);
      }

      // Get storage instance
      const storage = getStorage();

      // Create a unique filename
      const fileName = `profile-images/${user.uid}_${Date.now()}.jpg`;

      // Create storage reference
      const imageRef = ref(storage, fileName);

      //cover image
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      const blob = await response.blob();

      // Upload to Firebase Storage
      console.log('Uploading image to:', fileName);
      const uploadResult = await uploadBytes(imageRef, blob);
      console.log('Upload successful:', uploadResult);

      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      console.log('Download URL:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const removeProfileImage = async () => {
    try {
      if (profileImage) {
        setImageUploading(true);
        await deleteOldProfileImage(profileImage);
        setProfileImage('');
        setImageUploading(false);
        Alert.alert('Success', 'Profile picture removed successfully');
      }
    } catch (error) {
      console.error('Error removing profile image:', error);
      setImageUploading(false);
      Alert.alert('Error', 'Failed to remove profile picture');
    }
  };

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
      const updateData: {
        displayName: string;
        bio: string;
        interests: string;
        hideAge: boolean;
        email: string | null;
        uid: string;
        updatedAt: Date;
        profileImage: string;
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
        profileImage: profileImage,
      };

      if (!userProfile || !userProfile.createdAt) {
        updateData.createdAt = new Date();
      }
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updateData, { merge: true });

      console.log('Success', 'Your profile has been updated successfully!');

      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      console.log('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>Profile Picture</Text>
            <View style={styles.imageContainer}>
              <View style={styles.imagePreview}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="person" size={40} color="#666" />
                  </View>
                )}
              </View>
              <View style={styles.imageButtonContainer}>
                <Pressable
                  style={styles.imageButton}
                  onPress={pickImage}
                  disabled={imageUploading}
                >
                  <Ionicons
                    name={profileImage ? 'camera' : 'add'}
                    size={20}
                    color="#4fc3f7"
                  />
                  <Text style={styles.imageButtonText}>
                    {imageUploading
                      ? 'Uploading...'
                      : profileImage
                      ? 'Change Photo'
                      : 'Add Photo'}
                  </Text>
                </Pressable>
                {profileImage && (
                  <Pressable
                    style={styles.removeButton}
                    onPress={removeProfileImage}
                    disabled={imageUploading}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff4757" />
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>

          <InputField
            label="Age"
            value={lockedAge ? lockedAge.toString() : 'Not set'}
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
  imageSection: {
    marginBottom: 24,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  imageButtonContainer: {
    flex: 1,
    gap: 8,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#232a36',
    borderWidth: 2,
    borderColor: '#3a4149',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1f26',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#232a36',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4fc3f7',
    gap: 8,
  },
  imageButtonText: {
    color: '#4fc3f7',
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#232a36',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4757',
    gap: 8,
  },
  removeButtonText: {
    color: '#ff4757',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EditProfileComponent;
