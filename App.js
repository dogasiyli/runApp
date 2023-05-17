import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './screens/homeScreen';

import { styles } from './sheets/styles';

export default function App() {
  return (
  <SafeAreaProvider>
    <View style={styles.container}>

      <HomeScreen />
    
    </View>
  </SafeAreaProvider>
  );
}

