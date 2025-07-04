import { useEffect, useRef, useState } from 'react';
import { logEvent } from '../utils/logger';
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
        logEvent('NETWORK', 'Sin conexión');
      } else {
        console.log('🔌 Conectado');
        if (prevType.current === 'none') {
          logEvent('NETWORK', 'Conexión recuperada');
        }
        if (
          prevType.current !== 'unknown' &&
          prevType.current !== 'none' &&
          prevType.current !== type
        ) {
          const msg = type === 'wifi' ? 'Usando WiFi' : 'Usando datos móviles';
          logEvent('NETWORK', `Cambio de red: ${msg}`);
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
