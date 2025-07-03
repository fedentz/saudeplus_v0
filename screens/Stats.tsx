import React from 'react';
import { View } from 'react-native';
import ActivityRecord from '../components/ActivityRecord';

export default function Stats() {
  return (
    <View style={{ flex: 1 }}>
      <ActivityRecord />
    </View>
  );
}
