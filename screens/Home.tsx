import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function Home({ navigation }: any) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>VAMOS COMENÇAR?</Text>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => navigation.navigate('Activity')}
      >
        <Text style={styles.playIcon}>▶</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>
        presione o botao para iniciar uma nova atividade fisica
      </Text>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 40,
    },
    playButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 100,
      width: 120,
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
      elevation: 4,
    },
    playIcon: {
      fontSize: 60,
      color: theme.colors.white,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.darkGray,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
  });
