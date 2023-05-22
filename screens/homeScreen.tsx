import { View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';


import { getPermits, useLocation } from '../asyncOperations/requests';

import { INIT_PERMITS, INIT_POSITION } from '../assets/constants';

import { showGPSResults } from '../functions/display/showText';
import { BUTTON_toggleSavePosition } from '../functions/display/buttons';
import { saveToFile } from '../asyncOperations/fileOperations';
import { styles } from '../sheets/styles';

export function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [location, setLocation] = useState(INIT_POSITION);
  const [permits, setPermits] = useState(INIT_PERMITS);
  const [recordPosition, setRecordPosition] = useState(false);
  const [locationHistory, setLocationHistory] = useState(new Array(location));
  const [screenText2, setScreenText2] = useState("No locations yet");

  useEffect (() => {
    const _getPermits = async () => {
      const _permits = await getPermits('locationForeGround,locationBackGround,mediaLibrary');
      setPermits(_permits);
    }
    _getPermits()
    .catch(console.error);
  }, [])

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
      <View style={styles.container}>
        <Text>Save positions to text file</Text>
        {/* Button whith handler function named onPressLearnMore*/}
        <Button disabled={!permits["mediaLibrary"] && (recordPosition || locationHistory.length<=1)} onPress={() => saveToFile(locationHistory)} title="RecordPositions" color = {this.disabled ? "#ff0000" : "#00ffff"} />
      </View>
    </View>
  );
}