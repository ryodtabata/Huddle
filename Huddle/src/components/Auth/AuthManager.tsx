import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthScreen } from './AuthScreen';
import { useUser } from '../../store/UserContext';

interface AuthManagerProps {
  children: React.ReactNode;
}

export function AuthManager({ children }: AuthManagerProps) {
  const { user, loading } = useUser();

  const handleAuthSuccess = () => {
    console.log('Auth success');
    // User context will handle the rest
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Huddle</Text>
        <Text style={styles.loadingSubtext}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // User is authenticated - show home page
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181c24',
  },
  loadingText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4fc3f7',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#b0b0b0',
  },
});
