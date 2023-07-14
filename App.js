import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from './assets/stateContext';
import { useEffect } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Screen_GPS_Debug } from './screens/screen_gps';
import { Screen_MoveablePoints } from './screens/screen_movable_points';
import { Screen_Home } from './screens/screen_home';
import { Screen_Navigations } from './screens/screen_navigations';

import { style_container } from './sheets/styles';


import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

import { on_new_gps_data } from './asyncOperations/requests';
import { LOCATION_TRACKING_BACKGROUND, LOCATION_TRACKING } from './assets/constants';
import { getFormattedDateTime } from './asyncOperations/fileOperations';

const Stack = createNativeStackNavigator();
export default function App() {

  // useEffect for define task LOCATION_TRACKING_BACKGROUND
  // not being used for now
  useEffect(() => {
    // 1. Define the task by providing a name and the function that should be executed
    // Note: This needs to be called in the global scope (e.g outside of your React components)
    TaskManager.defineTask(LOCATION_TRACKING_BACKGROUND, async () => {
      const now = Date.now();
      console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
      // Be sure to return the successful result type!
      return BackgroundFetch.BackgroundFetchResult.NewData;
    });
  },[]);

    // useEffect for location tracking with startLocationUpdatesAsync
  // location updates are not as frequent as with watchPositionAsync
  useEffect(() => { 
    TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
      if (error) {
          console.log('LOCATION_TRACKING task ERROR:', error);
          return;
      }
      // as new locations come in, the following code will execute
      if (data) {
        on_new_gps_data(data, set_current_location);
      }
    });
  },[]);

  // useEffect for saving initial log as timestamp
  useEffect(() => {
    console.log("START : ", getFormattedDateTime())
  }, []);


  return (
  <SafeAreaProvider>
    <View style={style_container.container}>
      <AppStateProvider>
        <NavigationContainer>
        <Stack.Navigator screenOptions={{headerStyle: { backgroundColor: 'purple' },}}>
          <Stack.Screen name="Home" component={Screen_Home} />
          <Stack.Screen name="GPS_Debug" component={Screen_GPS_Debug} options={({ route }) => ({ title: route.params?.display_page_mode ||  "Debug GPS" })} />
          <Stack.Screen name="Moveable_Points" component={Screen_MoveablePoints} />
          <Stack.Screen name="Screen_Navigation" component={Screen_Navigations} options={{headerShown:false}}/>
          <Stack.Screen name="SpeedScreeN" component={Screen_GPS_Debug}  options={({ route }) => ({ title: route.params?.display_page_mode ||  "SpeedScreen" })} />
          <Stack.Screen name="MapScreen" component={Screen_GPS_Debug}  options={({ route }) => ({ title: route.params?.display_page_mode ||  "MapScreen" })} />
          <Stack.Screen name="PaceBlocks" component={Screen_GPS_Debug}  options={({ route }) => ({ title: route.params?.display_page_mode ||  "PaceBlockScreen" })} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </View>
  </SafeAreaProvider>
  );
}

