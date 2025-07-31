import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { FriendsList } from '../../components/Friends/FriendsList';
import { FriendRequests } from '../../components/Friends/FriendRequests';
import { Person } from '../../components/MainPage/PeopleList';
import { useFriendRequestCount } from '../../hooks/useFriendRequestCount';

export function Friends() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [refreshCount, setRefreshCount] = useState(0);
  const friendRequestCount = useFriendRequestCount(refreshCount);
  const { colors } = useTheme();

  const handleMessage = (person: Person) => {
    Alert.alert('Message', `Opening chat with ${person.name}...`);
    // navigation.navigate('Messages', { person });
  };

  const handleRequestCountChange = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.card }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Friends</Text>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === 'friends' && {
              backgroundColor: (colors as any).accent,
            },
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'friends' && {
                color: colors.background,
                fontWeight: 'bold',
              },
            ]}
          >
            My Friends
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            activeTab === 'requests' && {
              backgroundColor: (colors as any).accent,
            },
          ]}
          onPress={() => setActiveTab('requests')}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'requests' && {
                  color: colors.background,
                  fontWeight: 'bold',
                },
              ]}
            >
              Requests
            </Text>
            {friendRequestCount > 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: (colors as any).danger },
                ]}
              >
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    // borderBottomColor: '#232a36', // replaced with theme
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: '#fff', // replaced with theme
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    // backgroundColor: '#232a36', // replaced with theme
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    // backgroundColor: 'transparent', // replaced with theme
  },
  activeTab: {
    // backgroundColor: '#4fc3f7', // replaced with theme
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeTabText: {
    // color: '#fff', // replaced with theme
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
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    // backgroundColor: '#ff4757', // replaced with theme
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
