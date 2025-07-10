import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import MapView, { Marker, Polyline, AnimatedRegion } from 'react-native-maps';
import type { LocationObjectCoords } from 'expo-location';
import customMapStyle from '../../assets/mapStyle';
import mapStyleDarkMode from '../../assets/mapStyleDarkMode';
import { useTheme } from '../../context/ThemeContext';
import { useEmoji } from '../../context/EmojiContext';

type Props = {
  location: LocationObjectCoords;
  route: LocationObjectCoords[];
  mapReady: boolean;
  setMapReady: (ready: boolean) => void;
  mapRef: React.RefObject<MapView | null>;
};

export default function ActivityMap({ location, route, mapReady, setMapReady, mapRef }: Props) {
  useEffect(() => {
    console.time('MAP_LOAD');
  }, []);

  const { theme } = useTheme();
  const { emoji } = useEmoji();

  const coordinateRef = useRef<AnimatedRegion>(
    new AnimatedRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  );

  useEffect(() => {
    const { latitude, longitude } = location;
    coordinateRef.current
      .timing({
        latitude,
        longitude,
        duration: 500,
        useNativeDriver: false,
      } as any) // 👈 TypeScript fix temporal
      .start();

    if (mapReady && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        },
        500,
      );
    }
  }, [location, mapReady]);

  const handleMapReady = () => {
    console.timeEnd('MAP_LOAD');
    setMapReady(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        customMapStyle={theme === 'dark' ? mapStyleDarkMode : customMapStyle}
        ref={mapRef}
        style={{ flex: 1 }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        followsUserLocation
        showsUserLocation={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        showsCompass={false}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }}
        onMapReady={handleMapReady}
      >
        {route.length > 1 && (
          <Polyline coordinates={route} strokeColor="#0099ff" strokeWidth={4} />
        )}
        <Marker.Animated
          coordinate={coordinateRef.current as unknown as { latitude: number; longitude: number }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'transparent',
              overflow: 'hidden',
              width: 48,
              height: 48,
              borderRadius: 24,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                lineHeight: 44,
                textAlign: 'center',
                width: 48,
                height: 48,
              }}
            >
              {emoji}
            </Text>
          </View>
        </Marker.Animated>
      </MapView>
      {/* Placeholder to avoid Google logo overlap handled by footer */}
    </View>
  );
}
