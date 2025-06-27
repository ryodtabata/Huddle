import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import * as React from "react";
import { useColorScheme, ActivityIndicator, View } from "react-native";
import { Navigation } from "./navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthNavigator } from "./screens/auth/AuthNavigator";

const MyLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: "#f5f5f7", // Replace with your light theme color
  },
};

const MyDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: "#121212", // Replace with your dark theme color
  },
};

function AppContent() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? MyDarkTheme : MyLightTheme;
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#181c24" }}>
        <ActivityIndicator size="large" color="#4fc3f7" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <NavigationContainer theme={theme}>
        {isAuthenticated ? <Navigation /> : <AuthNavigator />}
      </NavigationContainer>
    </View>
  );
}

export function App() {
  React.useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
