import * as LocalAuthentication from 'expo-local-authentication';

export async function validateBiometricsStart(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!compatible || !enrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Verific\u00E1 tu identidad para comenzar',
    fallbackLabel: 'Usar c\u00F3digo',
  });

  return result.success;
}

export async function validateBiometricsEnd(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Verific\u00E1 tu identidad para finalizar',
    fallbackLabel: 'Usar c\u00F3digo',
  });

  return result.success;
}
