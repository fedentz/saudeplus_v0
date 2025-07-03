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
  mapLoaded: boolean;
  setMapLoaded: (ready: boolean) => void;
  mapRef: React.RefObject<MapView | null>;
};

export default function ActivityMap({
  location,
  route,
  mapLoaded,
  setMapLoaded,
  mapRef,
}: Props) {
  useEffect(() => {
    console.time('MAP_LOAD');
  }, []);

  const { theme } = useTheme();
  const { emoji } = useEmoji();

  const handleMapReady = () => {
    console.timeEnd('MAP_LOAD');
    setMapLoaded(true);
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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
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
          <Text style={{ fontSize: 32 }}>{emoji}</Text>
        </Marker>
      </MapView>
      {/* Placeholder to avoid Google logo overlap handled by footer */}
    </View>
  );
}
