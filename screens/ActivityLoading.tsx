import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function ActivityLoading() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const timer = setTimeout(() => navigation.navigate('Activity'), 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Preparando sua atividade...</Text>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
    text: { fontSize: 18, color: theme.colors.text },
  });
