import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import Home from '../screens/Home';
import StatsStack from './StatsStack';
import Profile from '../screens/Profile';
import { View, StyleSheet } from 'react-native';
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
        tabBarInactiveTintColor: isDark ? '#aaa' : '#444',
        tabBarStyle: {
          width: '90%',
          position: 'absolute',
          left: '5%',
          right: '5%',
          bottom: 20,
          height: 70,
          borderRadius: 35,
          backgroundColor: isDark ? '#1e1e1e' : theme.colors.white,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 3 },
          elevation: 8,
          borderTopWidth: 0,
          paddingTop: 15,
          paddingBottom: 15,
          marginLeft: '5%',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Stats':
              iconName = 'bar-chart';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return (
            <Ionicons 
              name={iconName as any} 
              size={26}
              color={color} 
            />
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

const styles = StyleSheet.create({
  // No styles needed now - simplified approach
});