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
import { Screen_Runners } from './screens/screen_runners';

import { Screen_Login } from './screens/screen_login';

import { style_container } from './sheets/styles';

import { getFormattedDateTime } from './asyncOperations/fileOperations';

const Stack = createNativeStackNavigator();
export default function App() {

  // useEffect for saving initial log as timestamp
  useEffect(() => {
    console.log("START : ", getFormattedDateTime())
  }, []);


  return (
  <SafeAreaProvider>
    <View style={style_container.container}>
      <AppStateProvider>
        <NavigationContainer>
        <Stack.Navigator screenOptions={{headerStyle: { backgroundColor: '#5555' },}}>
          <Stack.Screen name="Home" component={Screen_Home} />
          <Stack.Screen name="GPS_Debug" component={Screen_GPS_Debug} options={({ route }) => ({ title: route.params?.display_page_mode ||  "Debug GPS" })} />
          <Stack.Screen name="Moveable_Points" component={Screen_MoveablePoints} />
          <Stack.Screen name="Screen_Navigation" component={Screen_Navigations} options={{headerShown:false}}/>
          <Stack.Screen name="SpeedScreeN" component={Screen_GPS_Debug}  options={({ route }) => ({ title: route.params?.display_page_mode ||  "SpeedScreen" })} />
          <Stack.Screen name="MapScreen" component={Screen_GPS_Debug}  options={({ route }) => ({ title: route.params?.display_page_mode ||  "MapScreen" })} />
          <Stack.Screen name="PaceBlocks" component={Screen_GPS_Debug}  options={({ route }) => ({ title: route.params?.display_page_mode ||  "PaceBlockScreen" })} />
          <Stack.Screen name="Motivators" component={Screen_Runners}  options={({ route }) => ({ title: route.params?.display_page_mode ||  "Runners" })} />
          <Stack.Screen name="Login" component={Screen_Login}  options={({ route }) => ({ title: route.params?.display_page_mode ||  "Login" })} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </View>
  </SafeAreaProvider>
  );
}

