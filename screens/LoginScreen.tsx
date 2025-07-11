import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const { t } = useTranslation();

  const handleLogin = () => {
    // lógica de login
  };

  return (
    <View>
      <Text>{t('loginScreen.welcome')}</Text>
      <Button title={t('loginScreen.login')} onPress={handleLogin} />
    </View>
  );
}
