import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Stats from '../screens/Stats';

const Stack = createNativeStackNavigator();

export default function StatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatsMain" component={Stats} />
    </Stack.Navigator>
  );
}
