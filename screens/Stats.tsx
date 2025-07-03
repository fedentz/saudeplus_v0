import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import ActivityRecord from '../components/ActivityRecord';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Stats() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 40 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
    },
    title: { flex: 1, textAlign: 'center', color: theme.colors.text, fontSize: 16, fontWeight: 'bold' },
  });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Registro de Atividades</Text>
        <View style={{ width: 24 }} />
      </View>
      <ActivityRecord />
    </SafeAreaView>
  );
}
