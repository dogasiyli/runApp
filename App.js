import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from './assets/stateContext';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Screen_GPS_Debug } from './screens/screen_gps_debug';
import { Screen_MoveablePoints } from './screens/screen_movable_points';
import { Screen_Home } from './screens/screen_home';
import { Screen_Navigations } from './screens/screen_navigations';

import { style_container } from './sheets/styles';

const Stack = createNativeStackNavigator();
export default function App() {

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
          </Stack.Navigator>
        </NavigationContainer>
      </AppStateProvider>
    </View>
  </SafeAreaProvider>
  );
}

