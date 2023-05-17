import { Text, TouchableOpacity, View } from 'react-native';
import { Switch } from 'react-native-switch';
interface ViewRCProps {
    toggleVal:boolean;
    toggleFunc;
    trueStr:string;
    falseStr:string;
    renderBool: boolean;
  }

const toggle = (setFunction) => setFunction(previousState => !previousState);  
//https://github.com/shahen94/react-native-switch
export const BUTTON_toggleSavePosition: React.FC<ViewRCProps> = ({renderBool, toggleVal, toggleFunc, trueStr, falseStr}) => {
  if (!renderBool) {
    return null;
  }
  return (
   <View style={{flex:1, position: "absolute", marginTop:"30%", justifyContent: 'center', alignItems: 'center'}}>
    <Switch 
          value={toggleVal}
          disabled={false}
          onValueChange={() => toggle(toggleFunc)}
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