import { useEffect, useRef, useState } from 'react';
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo';
import { log } from '../utils/logger';

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
      const offline = !state.isConnected || state.isInternetReachable === false;

      setNetType(type);
      setIsOffline(offline);

      if (offline) {
        log('hooks/useNetworkListener.ts', 'listener', 'NETWORK', '🚫 Sin conexión');
      } else {
        log('hooks/useNetworkListener.ts', 'listener', 'NETWORK', '🔌 Conectado');
        if (prevType.current === 'none') {
          log('hooks/useNetworkListener.ts', 'listener', 'NETWORK', 'Conexión recuperada');
        }
        if (
          prevType.current !== 'unknown' &&
          prevType.current !== 'none' &&
          prevType.current !== type
        ) {
          const msg = type === 'wifi' ? 'Usando WiFi' : 'Usando datos móviles';
          log('hooks/useNetworkListener.ts', 'listener', 'NETWORK', `Cambio de red: ${msg}`);
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
