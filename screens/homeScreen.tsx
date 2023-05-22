import { View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';


import { getPermits, useLocationForeground } from '../asyncOperations/requests';

import { INIT_TIMES, INIT_POSITION } from '../assets/constants';


import { showGPSResults } from '../functions/display/showText';
import { BUTTON_toggleSavePosition } from '../functions/display/buttons';
import { saveToFile } from '../asyncOperations/fileOperations';
import { styles } from '../sheets/styles';


import { useAppState } from '../assets/stateContext';


export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [screenText2, setScreenText2] = useState("No locations yet");
  const { permits, set_permits, 
          current_location, set_current_location, 
          bool_record_locations, arr_location_history } = useAppState();

  //GET PERMISSIONS ASYNCHRONOUSLY
  useEffect (() => {
    const _getPermits = async () => {
      const _permits = await getPermits('locationForeGround,locationBackGround,mediaLibrary');
      set_permits(_permits);
    }
    _getPermits()
    .catch(console.error);
  }, [])

  //UPDATE GPS LOCATION
  useEffect(() => {
    const updateGPS = async () => {
      const _loc = await useLocationForeground();
      if (_loc!=null)
      {
        const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
        if (_loc.timestamp !== lastTimestamp) {
          console.log("111-current_loc:",_loc)
          set_current_location(_loc);
        }
      }
    }
    if (bool_record_locations)
    {
        const interval = setInterval(() => {
          updateGPS();
          }, INIT_TIMES.gpsUpdateMS);
        return () => clearInterval(interval);    
    }
  }, [bool_record_locations]);

  //RECORD GPS LOCATIONS INTO ARRAY
  useEffect(() => {
    //console.log("current_location:",current_location)
    const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
    if (current_location["timestamp"] !== lastTimestamp) {
      arr_location_history.push(current_location);
      if (arr_location_history.length%2==0)
      {
          setScreenText2("Num of locations:"+arr_location_history.length);
      }
    }
  }, [current_location]);

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top }}>
      <StatusBar style="auto" />
      <BUTTON_toggleSavePosition falseStr='Start' trueStr='Stop' renderBool={true}/>
      <View style={{alignSelf:"center", alignItems:"center", alignContent:"center", marginTop: '50%', width: '100%'}}>
          {showGPSResults(current_location)}
          <View>
            <Text>{screenText2}</Text>
          </View>
      </View>
      <View style={styles.container}>
        <Text>Save positions to text file</Text>
        {/* Button with handler function named onPressLearnMore*/}
        <Button disabled={!permits["mediaLibrary"] && (bool_record_locations || arr_location_history.length<=1)} onPress={() => saveToFile(arr_location_history)} title="RecordPositions" color = {this.disabled ? "#ff0000" : "#00ffff"} />
      </View>
    </View>
  );
}