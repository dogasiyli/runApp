import { Text, TouchableOpacity, View } from 'react-native';
import { Switch } from 'react-native-switch';  
import { useAppState } from '../../assets/stateContext';
interface ViewRCProps {
    trueStr:string;
    falseStr:string;
    renderBool: boolean;
  }


const toggle = (setFunction) => setFunction(previousState => !previousState);  
//https://github.com/shahen94/react-native-switch
export const BUTTON_toggleSavePosition: React.FC<ViewRCProps> = ({renderBool, trueStr, falseStr}) => {
  const { bool_record_locations, enable_record_locations } = useAppState();
  if (!renderBool) {
    return null;
  }
  return (
   <View style={{flex:1, position: "absolute", marginTop:"30%", justifyContent: 'center', alignItems: 'center'}}>
    <Switch 
          value={bool_record_locations}
          disabled={false}
          onValueChange={() => toggle(enable_record_locations)}
          activeText={trueStr}
          inActiveText={falseStr}
          backgroundInactive={'#00ff00'}
          backgroundActive={'#ff0000'}
          circleInActiveColor={'#00ffff'}
          circleActiveColor={'#ff00ff'}
          changeValueImmediately={true}
          switchWidthMultiplier={2}
   />  
  </View>
  );
};