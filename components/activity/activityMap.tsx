import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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

export default function ActivityMap({
  location,
  route,
  mapReady,
  setMapReady,
  mapRef,
}: Props) {
  useEffect(() => {
    console.time('MAP_LOAD');
  }, []);

  const { theme } = useTheme();
  const { emoji } = useEmoji();

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
        followsUserLocation={true}
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
        <Marker
          coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "transparent",
          overflow: "hidden",
          width: 48,
          height: 48,
          borderRadius: 24,
        }}
          >
        <Text
          style={{
            fontSize: 26,
            lineHeight: 44,
            textAlign: "center",
            width: 48,
            height: 48,
          }}
        >
          {emoji}
        </Text>
          </View>
        </Marker>
      </MapView>
      {/* Placeholder to avoid Google logo overlap handled by footer */}
    </View>
  );
}
