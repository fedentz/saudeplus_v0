import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import Splash from './screens/Splash';
import Login from './screens/Login';
import Register from './screens/Register';
import Activity from './screens/Activity';
import Settings from './screens/Settings';
import ChangePassword from './screens/ChangePassword';
import AdminPanel from './screens/AdminPanel';
import MainTabs from './navigation/MainTabs';
import './i18n';
import { ThemeProvider } from './context/ThemeContext';
import { EmojiProvider } from './context/EmojiContext';
import { PendingActivityProvider } from './context/PendingActivitiesContext';
import { KmProvider } from './context/KmContext';
import { ActivityProvider } from './context/ActivityContext';
import { useUser } from './hooks/useUser';
import useGlobalNetwork from './hooks/useGlobalNetwork';
import useActivitySync from './hooks/useActivitySync';
import { log } from './utils/logger';

const Stack = createNativeStackNavigator();

export default function App() {
  useGlobalNetwork();
  useActivitySync();
  const { user, loading, authInitialized } = useUser();

  if (!authInitialized) {
    log('App.tsx', 'App', 'AUTH', 'Esperando autenticación...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const initialRoute = user ? 'MainTabs' : 'Splash';
  log('App.tsx', 'App', 'APP', `Ruta inicial seleccionada: ${initialRoute}`);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <EmojiProvider>
        <PendingActivityProvider>
          <ActivityProvider>
            <KmProvider>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName={initialRoute}
                  screenOptions={{
                    headerShown: false,
                    animation: 'fade_from_bottom',
                    gestureEnabled: true,
                  }}
                >
                  <Stack.Screen name="Splash" component={Splash} />
                  <Stack.Screen name="Login" component={Login} />
                  <Stack.Screen name="Register" component={Register} />
                  <Stack.Screen name="MainTabs" component={MainTabs} />
                  <Stack.Screen name="Activity" component={Activity} />
                  <Stack.Screen name="Settings" component={Settings} />
                  <Stack.Screen name="ChangePassword" component={ChangePassword} />
                  <Stack.Screen name="AdminPanel" component={AdminPanel} />
                </Stack.Navigator>
              </NavigationContainer>
            </KmProvider>
          </ActivityProvider>
        </PendingActivityProvider>
      </EmojiProvider>
    </ThemeProvider>
  );
}
