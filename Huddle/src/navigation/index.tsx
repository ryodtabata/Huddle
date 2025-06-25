import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { Home } from "./screens/Home";
import { Profile } from "./screens/Profile";
import { Messages } from "./screens/Messages";
import { Friends } from "./screens/Freinds";
import { Settings } from "./screens/Settings";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#f8f9fa" },
      }}
    >
      <Stack.Screen name="ProfileMain" component={Profile} />
      <Stack.Screen name="Friends" component={Friends} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
}

export const Navigation = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Messages"
      component={Messages}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="chatbubble-outline" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Home"
      component={Home}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="globe" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStack}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person-outline" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);
