import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';

export default function useNetworkListener() {
  const [isOffline, setIsOffline] = useState(false);
  const [netType, setNetType] = useState<NetInfoStateType | 'unknown'>('unknown');
  const prevType = useRef<NetInfoStateType | 'none' | 'unknown'>('unknown');

  useEffect(() => {
    const setFromState = (state: {
      type?: NetInfoStateType;
      isConnected?: boolean | null;
      isInternetReachable?: boolean | null;
    }) => {
      const type = state.type ?? 'unknown';
      const offline =
        !state.isConnected || state.isInternetReachable === false;

      setNetType(type);
      setIsOffline(offline);

      if (offline) {
        console.log('🚫 Sin conexión');
        Alert.alert('🚫 Sin conexión', 'Conéctate a internet para continuar', [
          { text: 'OK' },
        ]);
      } else {
        console.log('🔌 Conectado');
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
      prevType.current = offline ? 'none' : type;
    };

    // Consultamos estado inicial
    NetInfo.fetch().then(setFromState);

    const unsubscribe = NetInfo.addEventListener(setFromState);

    return () => unsubscribe();
  }, []);

  return { isOffline, netType };
}
