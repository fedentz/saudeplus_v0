import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import type { LocationObjectCoords } from 'expo-location';
import customMapStyle from '../../assets/mapStyle';

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

  const handleMapReady = () => {
    console.timeEnd('MAP_LOAD');
    setMapReady(true);
  };

  return (
    <MapView
      customMapStyle={customMapStyle}
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
        <Text style={{ fontSize: 24 }}>🏃‍♂️</Text>
      </Marker>
    </MapView>
  );
}
