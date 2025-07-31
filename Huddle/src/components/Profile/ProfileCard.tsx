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
  tags?: string[];
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  age,
  bio,
  distance,
  imageUrl,
  verified = false,
  tags = [],
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={[styles.avatar, { borderColor: colors.background }]}
        />
        {verified && (
          <View
            style={[
              styles.verifiedIcon,
              { backgroundColor: colors.background },
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
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.card, // or use '#ccc' for a fixed grey
          },
        ]}
      >
        <Text style={[styles.bio, { color: colors.text }]}>{bio}</Text>
      </View>
      <View style={styles.tags}>
        {(tags.length > 0 ? tags : ['#anime', '#coding', '#music']).map(
          (tag, idx) => (
            <Text
              key={idx}
              style={[
                styles.tag,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.card,
                  borderWidth: 1,
                },
              ]}
            >
              {tag}
            </Text>
          )
        )}
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
  tags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 0,
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
