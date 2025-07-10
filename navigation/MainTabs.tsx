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
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor:
          theme.colors.background === '#121212' ? '#aaa' : '#444',
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 20,
          height: 60,
          borderRadius: 30,
          paddingVertical: 10,
          backgroundColor:
            theme.colors.white === '#000000' ? '#1e1e1e' : theme.colors.white,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 3 },
          elevation: 5,
        },
        tabBarIcon: ({ color, size }) => {
          let icon = 'home';
          if (route.name === 'Stats') icon = 'bar-chart';
          if (route.name === 'Profile') icon = 'person';
          return (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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
