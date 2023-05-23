import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoveableImage } from '../functions/display/buttons';
import { useAppState } from '../assets/stateContext';


export function Screen_MoveablePoints() {
  const insets = useSafeAreaInsets();
  const { moveableImages } = useAppState();

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top }}>
      <StatusBar style="auto" />
      <View style={{ flex: 1, position:"absolute",
                     left:insets.left, 
                     alignItems:"center", 
                     alignContent:"center", 
                     top: insets.top }}>
      {moveableImages.map((image, index) => (<MoveableImage key={index} id={index} renderBool={true}/>))}
      </View>
    </View>
  );
}