import React, { createContext, useContext, useState } from 'react';

interface KmContextProps {
  kilometers: number;
  setKilometers: React.Dispatch<React.SetStateAction<number>>;
}

const KmContext = createContext<KmContextProps>({
  kilometers: 0,
  setKilometers: () => {},
});

export const KmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kilometers, setKilometers] = useState(0);
  return (
    <KmContext.Provider value={{ kilometers, setKilometers }}>
      {children}
    </KmContext.Provider>
  );
};

export const useKilometers = () => useContext(KmContext);
