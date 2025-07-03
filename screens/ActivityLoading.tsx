import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';

export default function ActivityLoading() {
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const styles = createStyles(theme);
  const [isMapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (isMapReady) {
      navigation.replace('Activity');
    }
  }, [isMapReady, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Preparando sua atividade...</Text>
      <MapView
        style={styles.hiddenMap}
        onMapReady={() => setMapReady(true)}
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
    text: { fontSize: 18, color: theme.colors.text },
    hiddenMap: { width: 1, height: 1, opacity: 0 },
  });
