import { View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { style_home } from '../sheets/styles';

export function Screen_Home({navigation}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top }}>
      <StatusBar style="auto" />
      <Button title='GPS Debug Param:1' onPress={() => navigation.navigate("GPS_Debug", {someText:"this is some text"})} />
      <Button title='GPS Debug Param:2' onPress={() => navigation.navigate("GPS_Debug", {someText:"another text here"})} />
      <Button title='Moveable Points' onPress={() => navigation.navigate("Moveable_Points", {pointCount:"Moveable_Points"})} />
      <Button title='Screen Stack Example' onPress={() => navigation.navigate("Screen_Navigation", {someValue:123})}/>
    </View>
  );
}