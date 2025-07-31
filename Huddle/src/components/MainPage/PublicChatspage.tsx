import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { useUser } from '../../store/UserContext';
import {
  subscribeToProximityChats,
  joinProximityChat,
  getProximityChats,
} from '../../firebase/publicChatService';
import Ionicons from '@expo/vector-icons/Ionicons';
import PublicChatConvo from './PublicChatConvo';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PublicChatsPage = () => {
  const { user, userProfile } = useUser();
  const [publicChats, setPublicChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (user && userProfile && userProfile.location) {
      autoJoinProximityChat();
      subscribeToChats();
    }
  }, [user, userProfile]);

  const autoJoinProximityChat = async () => {
    if (!user || !userProfile || !userProfile.location) return;
    try {
      await joinProximityChat(
        user.uid,
        userProfile.displayName || user.email || 'Unknown User',
        userProfile.location
      );
    } catch (error) {
      console.error('Error joining proximity chat:', error);
    }
  };

  const subscribeToChats = () => {
    if (!userProfile?.location) return;
    const unsubscribe = subscribeToProximityChats(
      userProfile.location,
      (chats: any) => {
        setPublicChats(chats);
      }
    );
    return unsubscribe;
  };

  const handleRefresh = async () => {
    if (!userProfile?.location) return;
    setRefreshing(true);
    try {
      const chats = await getProximityChats(userProfile.location);
      setPublicChats(chats);
    } catch (error) {
      console.error('Error refreshing chats:', error);
      Alert.alert('Error', 'Failed to refresh chats');
    } finally {
      setRefreshing(false);
    }
  };

  const renderChatItem = ({ item }: any) => (
    <Pressable
      style={[
        styles.chatItem,
        {
          borderBottomColor: colors.card,
          backgroundColor: colors.background,
          width: '100%',
        },
      ]}
      onPress={() => setSelectedChat(item)}
    >
      <View style={[styles.chatIcon, { backgroundColor: colors.card }]}>
        <Ionicons name="location" size={24} color={(colors as any).accent} />
      </View>
      <View style={styles.chatInfo}>
        <Text style={[styles.chatName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.chatDetails, { color: (colors as any).accent }]}>
          {item.participantCount} people • {Math.round(item.distance / 1000)}km
          away
        </Text>
        <Text style={[styles.lastMessage, { color: colors.text + '99' }]}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text + '99'} />
    </Pressable>
  );

  if (!userProfile?.location) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.noLocationContainer}>
          <Ionicons
            name="location-outline"
            size={64}
            color={colors.text + '99'}
          />
          <Text style={[styles.noLocationTitle, { color: colors.text }]}>
            Location Required
          </Text>
          <Text style={[styles.noLocationText, { color: colors.text + '99' }]}>
            Enable location services to join local public chats in your area.
          </Text>
        </View>
      </View>
    );
  }
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.card, width: '100%' },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Public Chats</Text>
        <Text style={[styles.subtitle, { color: colors.text + '99' }]}>
          Chat with people within 5km of your location
        </Text>
      </View>

      <FlatList
        data={publicChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={(colors as any).accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={colors.text + '99'}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Public Chats
            </Text>
            <Text style={[styles.emptyText, { color: colors.text + '99' }]}>
              No one else is nearby right now. Pull to refresh or wait for
              others to join!
            </Text>
          </View>
        }
        contentContainerStyle={
          publicChats.length === 0 ? styles.emptyList : styles.list
        }
        style={{ flex: 1, width: '100%' }}
      />

      {selectedChat && (
        <PublicChatConvo
          chat={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  list: {
    padding: 0,
  },
  emptyList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    width: '100%',
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  chatDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noLocationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noLocationText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default PublicChatsPage;
