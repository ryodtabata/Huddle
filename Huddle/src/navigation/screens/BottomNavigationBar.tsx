import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Home } from './Home';
import { Profile } from './Profile';
import { Messages } from './Messages';

const Tab = createBottomTabNavigator();

//use

const BottomNavigationBar = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={Home}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home-outline" color={color} size={size} />
        ),
      }}
    />
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
      name="Profile"
      component={Profile}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="person-outline" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default BottomNavigationBar;
