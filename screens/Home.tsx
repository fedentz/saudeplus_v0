import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RootStackParamList } from '../App';
import NavBar from '../components/NavBar';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>VAMOS COMENÇAR?</Text>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => navigation.navigate('Activity')}
      >
        <Text style={styles.playIcon}>▶</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>
        presione o botao para iniciar uma nova atividade fisica
      </Text>

      <NavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#03A9F4',
    textAlign: 'center',
    marginBottom: 40,
  },
  playButton: {
    backgroundColor: '#03A9F4',
    borderRadius: 100,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  playIcon: {
    fontSize: 60,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#03A9F4',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
