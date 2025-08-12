import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface ProfileCardProps {
  name: string;
  age: number;
  bio: string;
  distance: string;
  imageUrl: string;
  verified?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  age,
  bio,
  distance,
  imageUrl,
  verified = false,
}) => {
  const { colors } = useTheme();
  const isDarkMode =
    colors.background === '#000000' || colors.background.includes('#1');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? '#3a3a3a' : colors.card,
          borderWidth: isDarkMode ? 1 : 0,
          borderColor: isDarkMode ? '#4a4a4a' : 'transparent',
        },
      ]}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.avatar, { borderColor: colors.background }]}
        />
        {verified && (
          <View
            style={[
              styles.verifiedIcon,
              { backgroundColor: isDarkMode ? '#4a4a4a' : colors.background },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={32}
              color={(colors as any).accent}
            />
          </View>
        )}
      </View>
      <Text style={[styles.name, { color: colors.text }]}>
        {name},{' '}
        <Text style={[styles.age, { color: colors.text + '99' }]}>{age}</Text>
      </Text>
      <Text style={[styles.distance, { color: colors.text + '99' }]}>
        {distance}
      </Text>
      <View
        style={[
          styles.bioContainer,
          {
            backgroundColor: isDarkMode ? '#2a2a2a' : colors.background,
            borderWidth: 1,
            borderColor: isDarkMode ? '#4a4a4a' : colors.card,
          },
        ]}
      >
        <Text style={[styles.bio, { color: colors.text }]}>{bio}</Text>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    padding: 16,
    height: 550,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 16,
    width: width * 0.9,
  },
  avatarContainer: {
    position: 'relative',
    width: 225,
    height: 225,
    marginBottom: 8,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 225,
    height: 225,
    borderRadius: 60,
    borderWidth: 4,
  },
  verifiedIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  age: {
    fontWeight: '400',
  },
  distance: {
    fontSize: 14,
    marginBottom: 8,
  },
  bioContainer: {
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
    width: '100%',
    elevation: 2,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
  },

  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
