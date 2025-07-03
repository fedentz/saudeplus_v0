import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function Home({ navigation }: any) {
  const theme = useAppTheme();
  const styles = createStyles(theme);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>VAMOS COMEÇAR?</Text>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => navigation.navigate('Activity')}
        >
          <Text style={styles.playIcon}>▶</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          pressione o botão para iniciar uma nova atividade física
        </Text>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 24,
    },
    playButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 100,
      width: 120,
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 32,
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
