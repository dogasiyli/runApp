import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import { useLocation } from '../asyncOperations/requests';
import { INIT_POSITION } from '../assets/constants';

import { showGPSResults } from '../functions/display/showText';
import { BUTTON_toggleSavePosition } from '../functions/display/buttons';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState(INIT_POSITION);
  const [recordPosition, setRecordPosition] = useState(false);
  const [locationHistory, setLocationHistory] = useState(new Array(location));
  const [screenText2, setScreenText2] = useState("No locations yet");

  const handleToggle = () => {
    setRecordPosition((current) => !current);
  };

  useEffect(() => {
    if (recordPosition)
    {
        const interval = setInterval(() => {
            useLocation(setLocation, "f");
          }, 500);
        return () => clearInterval(interval);    
    }
  }, [recordPosition]);

  useEffect(() => {
    locationHistory.push(location);
    if (locationHistory.length%5==0)
    {
        //console.log(locationHistory)
        setScreenText2("Num of locations:"+locationHistory.length);
    }
  }, [location]);

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top }}>
      <StatusBar style="auto" />
      <BUTTON_toggleSavePosition falseStr='Start' trueStr='Stop' toggleFunc={setRecordPosition} toggleVal={recordPosition} renderBool={true}/>
      <View style={{alignSelf:"center", alignItems:"center", alignContent:"center", marginTop: '50%', width: '100%'}}>
          {showGPSResults(location)}
          <View>
            <Text>{screenText2}</Text>
          </View>
      </View>
    </View>
  );
}