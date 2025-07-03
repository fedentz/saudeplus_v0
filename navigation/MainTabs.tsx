import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import Home from '../screens/Home';
import Stats from '../screens/Stats';
import Profile from '../screens/Profile';
import { useAppTheme } from '../hooks/useAppTheme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const theme = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: { backgroundColor: theme.colors.background },
        tabBarIcon: ({ color, size }) => {
          let icon = 'home';
          if (route.name === 'Stats') icon = 'bar-chart';
          if (route.name === 'Profile') icon = 'person';
          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Stats" component={Stats} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
