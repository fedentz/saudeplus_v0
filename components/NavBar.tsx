// components/NavBar.tsx
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function NavBar() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Button title="Historial" onPress={() => navigation.navigate('Stats')} />
      <Button title="Mi Usuario" onPress={() => navigation.navigate('Profile')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#eee',
  },
});
