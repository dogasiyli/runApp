import { View, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BT_Circle_Clickable } from '../functions/display/buttons';

export function Screen_Home({navigation}) {
  const insets = useSafeAreaInsets();
  return (
    <>
    <StatusBar backgroundColor="white" style="auto" />
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
      <BT_Circle_Clickable renderBool={true} top="10%" left="10%" size_perc={0.25} nav={navigation} page_name="GPS Debug" page_navigate_str="GPS_Debug" display_page_mode="Debug Screen" />
      <BT_Circle_Clickable renderBool={true} top="10%" left="40%" size_perc={0.25} nav={navigation} page_name="Moving Pts" page_navigate_str="Moveable_Points" />
      <BT_Circle_Clickable renderBool={true} top="10%" left="70%" size_perc={0.25} nav={navigation} page_name="Screen Stack" page_navigate_str="Screen_Navigation" />
      <BT_Circle_Clickable renderBool={true} top="40%" left="10%" size_perc={0.25} nav={navigation} page_name="Speeds" page_navigate_str="GPS_Debug" display_page_mode="SpeedScreens"  />
    </View>
    </>
  );
}