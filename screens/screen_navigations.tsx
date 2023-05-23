import { View, Button} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {  } from 'react-native-paper';


export function Screen_Navigations({navigation}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", alignSelf:"center", paddingTop: insets.top }}>
      <StatusBar style="auto" />
      <View style={{ flex: 1, position:"absolute",
                     alignItems:"center", 
                     alignContent:"center", 
                     alignSelf:"center",
                     top: "50%" }}>
      <Button title="Pop to root" onPress={() => navigation.popToTop()} />
      <Button title="Pops" onPress={() => navigation.pop()} />
      </View>
    </View>
  );
}