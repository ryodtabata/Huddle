import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { NearbyPeople } from '../../components/MainPage/NearbyPeople';
import PuclicChatsPage from '../../components/MainPage/PublicChatspage';
import { useUser } from '../../store/UserContext';

const TABS = [
  { key: 'nearby', label: 'People Nearby' },
  { key: 'chats', label: 'Public Chats' },
];

export function Home() {
  const { user, userProfile, loading } = useUser();
  const [activeTab, setActiveTab] = useState('nearby');

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.content}>
        {activeTab === 'nearby' ? <NearbyPeople /> : <PuclicChatsPage />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    alignItems: 'center',
    backgroundColor: '#181c24',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#232a36',
    borderRadius: 24,
    padding: 4,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#4fc3f7',
  },
  tabButtonText: {
    color: '#b0b0b0',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  contentText: {
    color: '#fff',
    fontSize: 18,
  },
});
