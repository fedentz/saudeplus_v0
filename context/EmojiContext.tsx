import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EmojiContextProps {
  emoji: string;
  setEmoji: (e: string) => void;
}

const EmojiContext = createContext<EmojiContextProps>({ emoji: '🏃‍♂️', setEmoji: () => {} });

export const EmojiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emoji, setEmojiState] = useState('🏃‍♂️');

  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem('ACTIVITY_EMOJI');
      if (saved) setEmojiState(saved);
    };
    load();
  }, []);

  const setEmoji = async (e: string) => {
    setEmojiState(e);
    await AsyncStorage.setItem('ACTIVITY_EMOJI', e);
  };

  return <EmojiContext.Provider value={{ emoji, setEmoji }}>{children}</EmojiContext.Provider>;
};

export const useEmoji = () => useContext(EmojiContext);
