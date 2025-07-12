import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Platform, View } from 'react-native';
import MapView from 'react-native-maps';
import * as LocalAuthentication from 'expo-local-authentication';

import customMapStyle from '../assets/mapStyle';

export default function SecureMap() {
  const [authenticated, setAuthenticated] = useState(false);

  const authenticate = useCallback(async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!compatible || !enrolled) {
      Alert.alert('Biometría no disponible');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autentícate',
      fallbackLabel: 'Usar código',
    });

    if (result.success) {
      setAuthenticated(true);
    } else {
      Alert.alert('Autenticación cancelada');
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  if (!authenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Button title="Reintentar" onPress={authenticate} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={Platform.OS === 'android' ? 'google' : undefined}
        customMapStyle={Platform.OS === 'android' ? customMapStyle : undefined}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : undefined}
        showsPointsOfInterest={false}
        showsTraffic={false}
        showsBuildings={false}
        showsCompass={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        zoomControlEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        zoomEnabled={Platform.OS === 'android'}
        scrollEnabled={Platform.OS === 'android'}
      />
      <View style={{ position: 'absolute', bottom: 40, alignSelf: 'center' }}>
        <Button title="Autenticar" onPress={authenticate} />
      </View>
    </View>
  );
}
