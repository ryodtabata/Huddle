import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthScreen } from "./AuthScreen";
import { ProfileSetup } from "./ProfileSetup";

type AuthState =
  | "loading"
  | "unauthenticated"
  | "authenticated"
  | "profile-setup";

interface AuthManagerProps {
  children: React.ReactNode;
}

export function AuthManager({ children }: AuthManagerProps) {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [userNeedsProfileSetup, setUserNeedsProfileSetup] = useState(false);

  useEffect(() => {
    // TODO: Check if user is already authenticated
    // For now, simulate loading and set to unauthenticated
    const checkAuthState = async () => {
      try {
        // Simulate checking authentication status
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // TODO: Replace with actual auth check
        // const user = await getCurrentUser();
        // if (user) {
        //   const hasProfile = await checkUserProfile(user.uid);
        //   if (hasProfile) {
        //     setAuthState('authenticated');
        //   } else {
        //     setAuthState('profile-setup');
        //   }
        // } else {
        //   setAuthState('unauthenticated');
        // }

        setAuthState("unauthenticated");
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthState("unauthenticated");
      }
    };

    checkAuthState();
  }, []);

  const handleAuthSuccess = () => {
    // In a real app, you'd check if the user needs profile setup
    // For demo purposes, we'll always show profile setup for new signups
    setAuthState("profile-setup");
  };

  const handleProfileComplete = () => {
    setAuthState("authenticated");
  };

  if (authState === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Huddle</Text>
        <Text style={styles.loadingSubtext}>Loading...</Text>
      </View>
    );
  }

  if (authState === "unauthenticated") {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (authState === "profile-setup") {
    return <ProfileSetup onComplete={handleProfileComplete} />;
  }

  // User is authenticated and has completed profile setup
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#181c24",
  },
  loadingText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4fc3f7",
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: "#b0b0b0",
  },
});
