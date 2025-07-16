import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from '../../firebase/authFunctions'; // Adjust the import path as needed

export function Settings() {
  const navigation = useNavigation<any>();
  const handleSettingsPress = (setting: string) => {
    Alert.alert(setting, `${setting} functionality coming soon!`);
  };

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        { backgroundColor: pressed ? '#232a36' : 'transparent' },
      ]}
      onPress={onPress}
    >
      <View style={styles.settingsItemLeft}>
        <Ionicons name={icon as any} size={24} color="#4fc3f7" />
        <View style={styles.settingsItemText}>
          <Text style={styles.settingsItemTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showArrow && <Ionicons name="chevron-forward" size={20} color="#666" />}
    </Pressable>
  );

  const SettingsSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
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
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Account">
          <SettingsItem
            icon="person-outline"
            title="Account Information"
            subtitle="Email, phone, username"
            onPress={() => signOut()}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Privacy"
            subtitle="Control who can see your content"
            onPress={() => handleSettingsPress('Privacy')}
          />
          <SettingsItem
            icon="key-outline"
            title="Password & Security"
            subtitle="Change password, two-factor auth"
            onPress={() => handleSettingsPress('Password & Security')}
          />
          <SettingsItem
            icon="checkmark-circle-outline"
            title="Request Verification"
            subtitle="Get verified badge"
            onPress={() => handleSettingsPress('Request Verification')}
          />
        </SettingsSection>

        <SettingsSection title="Privacy & Safety">
          <SettingsItem
            icon="eye-off-outline"
            title="Blocked Accounts"
            subtitle="Manage blocked users"
            onPress={() => handleSettingsPress('Blocked Accounts')}
          />
          <SettingsItem
            icon="notifications-outline"
            title="Notifications"
            subtitle="Push, email, SMS"
            onPress={() => handleSettingsPress('Notifications')}
          />
          <SettingsItem
            icon="location-outline"
            title="Location Services"
            subtitle="Manage location sharing"
            onPress={() => handleSettingsPress('Location Services')}
          />
        </SettingsSection>

        <SettingsSection title="Content & Display">
          <SettingsItem
            icon="moon-outline"
            title="Theme"
            subtitle="Dark, light, auto"
            onPress={() => handleSettingsPress('Theme')}
          />
        </SettingsSection>

        <SettingsSection title="Support">
          <SettingsItem
            icon="mail-outline"
            title="Contact Us"
            subtitle="Get help from our team"
            onPress={() => handleSettingsPress('Contact Us')}
          />
          <SettingsItem
            icon="flag-outline"
            title="Report a Problem"
            subtitle="Report bugs or issues"
            onPress={() => handleSettingsPress('Report a Problem')}
          />
          <SettingsItem
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Read our terms"
            onPress={() => handleSettingsPress('Terms of Service')}
          />
        </SettingsSection>

        <SettingsSection title="Account Actions">
          <SettingsItem
            icon="pause-outline"
            title="Deactivate Account"
            subtitle="Temporarily disable account"
            onPress={() => handleSettingsPress('Deactivate Account')}
          />
          <SettingsItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete account"
            onPress={() =>
              Alert.alert(
                'Delete Account',
                'Are you sure you want to permanently delete your account? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive' },
                ]
              )
            }
          />
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Huddle v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 Huddle Inc.</Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#232a36',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4fc3f7',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: '#232a36',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#3a4149',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    marginLeft: 16,
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
