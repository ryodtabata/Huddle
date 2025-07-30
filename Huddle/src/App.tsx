import {
  NavigationContainer,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { Navigation } from './navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthManager } from './components/Auth/AuthManager';
import { UserProvider } from './store/UserContext';

const MyLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: '#f0f0f0', // Light background color
    secondBackground: '#f0f0f0',
    card: '#e0e0e0',
    accent: '#4fc3f7',
    danger: '#ff4757',
    text: '#000',
  },
};

const MyDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: '#000',
    secondBackground: '#303030ff',
    card: '#000000ff',
    accent: '#09efffff',
    danger: '#ff4757',
    text: '#ffffffff',
    // Add more as needed
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
      <NavigationContainer theme={theme}>
        <UserProvider>
          <AuthManager>
            <Navigation />
          </AuthManager>
        </UserProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
