import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FriendsList } from '../../components/Friends/FriendsList';
import { FriendRequests } from '../../components/Friends/FriendRequests';
import { Person } from '../../components/MainPage/PeopleList';
import { useFriendRequestCount } from '../../hooks/useFriendRequestCount';

export function Friends() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [refreshCount, setRefreshCount] = useState(0);
  const friendRequestCount = useFriendRequestCount(refreshCount);

  const handleMessage = (person: Person) => {
    Alert.alert('Message', `Opening chat with ${person.name}...`);
    // navigation.navigate('Messages', { person });
  };

  const handleRequestCountChange = useCallback(() => {
    // Force re-fetch of friend request count
    setRefreshCount((prev) => prev + 1);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4fc3f7" />
        </Pressable>
        <Text style={styles.title}>Friends</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'friends' && styles.activeTabText,
            ]}
          >
            My Friends
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'requests' && styles.activeTabText,
              ]}
            >
              Requests
            </Text>
            {friendRequestCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {friendRequestCount > 99 ? '99+' : friendRequestCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'friends' ? (
          <FriendsList onMessage={handleMessage} />
        ) : (
          <FriendRequests onRequestCountChange={handleRequestCountChange} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181c24',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#232a36',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#232a36',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4fc3f7',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
