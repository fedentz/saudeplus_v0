import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import Home from '../screens/Home';
import StatsStack from './StatsStack';
import Profile from '../screens/Profile';
import { View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const theme = useAppTheme();
  const isDark = theme.colors.background === '#121212';
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.background === '#121212' ? '#aaa' : '#444',
        tabBarStyle: {
          position: 'absolute',
          alignSelf: 'center',
          bottom: 20,
          width: '90%',
          height: 60,
          borderRadius: 30,
          backgroundColor: isDark ? '#1e1e1e' : '#fff',
          shadowColor: isDark ? '#111' : '#e0e0e0',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarIcon: ({ color, size }) => {
          let icon = 'home';
          if (route.name === 'Stats') icon = 'bar-chart';
          if (route.name === 'Profile') icon = 'person';
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={icon as any} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Stats" component={StatsStack} />
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
