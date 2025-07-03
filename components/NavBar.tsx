// components/NavBar.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

export default function NavBar() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate('Stats')} style={styles.btn}>
        <Text style={styles.btnText}>Historial</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.btn}>
        <Text style={styles.btnText}>Mi Usuario</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderColor: theme.colors.gray,
  },
  btn: { padding: 10 },
  btnText: { color: theme.colors.primary, fontWeight: 'bold' },
});
