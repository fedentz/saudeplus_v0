import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';

export default function Settings() {
  const navigation = useNavigation<any>();
  const { theme, toggleTheme } = useTheme();
  const appTheme = useAppTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: appTheme.colors.background,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderColor: appTheme.colors.gray,
    },
    label: { color: appTheme.colors.text, fontSize: 16 },
    link: { color: appTheme.colors.primary, fontSize: 16 },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingItem}>
        <Text style={styles.label}>Modo escuro</Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
      </View>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => navigation.navigate('ChangePassword')}
      >
        <Text style={styles.link}>Cambiar contraseña</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
