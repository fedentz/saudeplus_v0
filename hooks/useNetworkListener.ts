import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';

export default function useNetworkListener() {
  const [isOffline, setIsOffline] = useState(false);
  const [netType, setNetType] = useState<NetInfoStateType | 'unknown'>('unknown');
  const prevType = useRef<NetInfoStateType | 'none' | 'unknown'>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const type = state.type ?? 'unknown';
      const connected = Boolean(state.isConnected);
      setNetType(type);
      setIsOffline(!connected);

      if (!connected) {
        Alert.alert('🚫 Sin conexión', 'Conéctate a internet para continuar', [
          { text: 'OK' },
        ]);
      } else {
        if (prevType.current === 'none') {
          Alert.alert('🔄 Conexión recuperada', 'Vuelves a estar en línea', [
            { text: 'Genial' },
          ]);
        }
        if (
          prevType.current !== 'unknown' &&
          prevType.current !== 'none' &&
          prevType.current !== type
        ) {
          const msg = type === 'wifi' ? 'Usando WiFi' : 'Usando datos móviles';
          Alert.alert('📶 Cambio de red', msg, [{ text: 'OK' }]);
        }
      }
      prevType.current = connected ? type : 'none';
    });

    return () => unsubscribe();
  }, []);

  return { isOffline, netType };
}
