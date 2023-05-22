import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from './assets/stateContext';

import { HomeScreen } from './screens/homeScreen';

import { styles } from './sheets/styles';

import { Gyroscope } from 'expo-sensors';

export default function App() {

  return (
  <SafeAreaProvider>
    <View style={styles.container}>

      <AppStateProvider>
        <HomeScreen />
      </AppStateProvider>
      
    </View>
  </SafeAreaProvider>
  );
}

