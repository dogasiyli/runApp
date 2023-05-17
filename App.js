import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './screens/homeScreen';
import * as Location from "expo-location"

import { styles } from './sheets/styles';


import { Camera } from 'expo-camera';
import { Gyroscope } from 'expo-sensors';

const FORE_BACK = "f";

export default function App() {

  useEffect(() => {
    async function setLocationWithPerms() {
      let { status } = FORE_BACK=="f" ? await Location.requestForegroundPermissionsAsync() : await Location.requestBackgroundPermissionsAsync();
      if (status === "granted") {
        console.log("YESSS permissions:",status);
      }
      else {
        console.log("NOOO permissions:",status);
      }
    }
    setLocationWithPerms();
  }, []);

  return (
  <SafeAreaProvider>
    <View style={styles.container}>

      <HomeScreen />
    
    </View>
  </SafeAreaProvider>
  );
}

