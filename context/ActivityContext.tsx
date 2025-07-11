import React, { createContext, useContext, useState } from 'react';

export interface SuspiciousFlags {
  biometricsRejected: boolean;
  speedTooHigh: boolean;
  noWalkingPattern: boolean;
  gpsInactive: boolean;
  inactiveTimeout: boolean;
}

interface ActivityCtx {
  suspiciousFlags: SuspiciousFlags;
  setFlag: (flag: keyof SuspiciousFlags, value: boolean) => void;
  resetFlags: () => void;
}

const defaultFlags: SuspiciousFlags = {
  biometricsRejected: false,
  speedTooHigh: false,
  noWalkingPattern: false,
  gpsInactive: false,
  inactiveTimeout: false,
};

const ActivityContext = createContext<ActivityCtx>({
  suspiciousFlags: defaultFlags,
  setFlag: () => {},
  resetFlags: () => {},
});

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suspiciousFlags, setSuspiciousFlags] = useState<SuspiciousFlags>(defaultFlags);

  const setFlag = (flag: keyof SuspiciousFlags, value: boolean) =>
    setSuspiciousFlags((prev) => ({ ...prev, [flag]: value }));

  const resetFlags = () => setSuspiciousFlags(defaultFlags);

  return (
    <ActivityContext.Provider value={{ suspiciousFlags, setFlag, resetFlags }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivityFlags = () => useContext(ActivityContext);
