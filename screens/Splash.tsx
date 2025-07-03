import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saúde+</Text>
      <Text style={styles.subtitle}>Transforme passos em economia</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.primaryButtonText}>CRIAR CONTA</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.secondaryButtonText}>JÁ POSSUO CONTA</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>© 2025 Saúde+. Todos os direitos reservados.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    color: '#00BFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#00BFFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderColor: '#00BFFF',
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: '#00BFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    color: '#666',
  },
});
