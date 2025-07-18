import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Navigation } from './navigation';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthManager } from './components/Auth/AuthManager';
import { UserProvider } from './store/UserContext';

const MyLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: '#f5f5f7', // Replace with actual light theme color.. change the gray
  },
};

const MyDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: '#121212', // Replace with actual dark theme color
  },
};

export function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? MyDarkTheme : MyLightTheme;

  React.useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <AuthManager>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <NavigationContainer theme={theme}>
              <Navigation />
            </NavigationContainer>
          </View>
        </AuthManager>
      </UserProvider>
    </SafeAreaProvider>
  );
}
