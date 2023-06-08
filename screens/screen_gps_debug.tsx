import { View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import { getPermits, useLocationForeground, registerBackgroundFetchAsync } from '../asyncOperations/requests';

import { INIT_TIMES, LOCATION_TRACKING, LOCATION_TRACKING_BACKGROUND, OfflineLocationData } from '../assets/constants';


import { showGPSResults } from '../functions/display/showText';
import { BT_Circle_Text_GPS, Circle_Text_Error, DisplayData } from '../functions/display/buttons';
import { saveToFile, getFormattedDateTime, getReadableDuration } from '../asyncOperations/fileOperations';
import { style_container } from '../sheets/styles';

import { useAppState } from '../assets/stateContext';

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from '../asyncOperations/requests';
import { on_new_gps_data } from '../asyncOperations/gpsOperations';
import { handleTimerInterval } from '../asyncOperations/utils';


export function Screen_GPS_Debug({route}) {
  const insets = useSafeAreaInsets();
  const [screenText, setscreenText] = useState("No locations yet");
  const { permits, set_permits, 
          bool_location_background_started, set_location_background_started,
          current_location, set_current_location, 
          bool_record_locations, arr_location_history,
          bool_update_locations, enable_update_locations,

          initTimestamp, setInitTimestamp,
          lastTimestamp, setLastTimestamp,
          activeTime, setActiveTime,
          passiveTime, setPassiveTime,
          totalTime, setTotalTime,
        } = useAppState();
  const someText = route.params.someText;

  // useEffect for define task LOCATION_TRACKING_BACKGROUND
  // not being used for now
  useEffect(() => {
    // 1. Define the task by providing a name and the function that should be executed
    // Note: This needs to be called in the global scope (e.g outside of your React components)
    TaskManager.defineTask(LOCATION_TRACKING_BACKGROUND, async () => {
      const now = Date.now();
      console.log(`Got background fetch call at date: ${new Date(now).toISOString()}`);
      // Be sure to return the successful result type!
      return BackgroundFetch.BackgroundFetchResult.NewData;
    });
  },[]);

  // useEffect for location tracking with startLocationUpdatesAsync
  // location updates are not as frequent as with watchPositionAsync
  useEffect(() => { 
    TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
      if (error) {
          console.log('LOCATION_TRACKING task ERROR:', error);
          return;
      }
      // as new locations come in, the following code will execute
      if (data) {
        on_new_gps_data(data, set_current_location);
      }
    });
  },[]);

  //useEffect for setting up background location tracking on and off
  useEffect(() => {
    if (bool_location_background_started )
    {
      console.log("STARTING BACKGROUND LOCATION TRACKING")
      startBackgroundLocationTracking()
    }
    else
    {
      console.log("STOPPING BACKGROUND LOCATION TRACKING")
      stopBackgroundLocationTracking(set_location_background_started)
    }
  },[bool_location_background_started]);

  // useEffect for saving initial log as timestamp
  useEffect(() => {
    console.log("START : ", getFormattedDateTime())
  }, []);

  // useEffect for getting permissions
  useEffect (() => {
    const _getPermits = async () => {
      const _permits = await getPermits('locationForeGround,locationBackGround,mediaLibrary');
      set_permits(_permits);
    }
    _getPermits()
    .catch(console.error);
  }, [])

  // useEffect for updating location info using watchPositionAsync
  useEffect(() => {
    const updateGPS = async () => {
      const _loc = await useLocationForeground();
      if (_loc!=null)
      {
        const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
        if (_loc.timestamp !== lastTimestamp) {
          //console.log("111-current_loc:",_loc)
          set_current_location(_loc);
        }
      }
    }
    // if recording is enabled but updating is not, then enable updating
    if (bool_record_locations && !bool_update_locations)
    {
      enable_update_locations(true);
    }
    // if either recording or updating is enabled, then update GPS
    if (bool_update_locations || bool_record_locations)
    {
        const interval = setInterval(() => {
          updateGPS();
          }, INIT_TIMES.gpsUpdateMS);
        return () => clearInterval(interval);    
    }
  }, [bool_record_locations, bool_update_locations]);

  useEffect(() => {
    const handleInterval = setInterval(async () => {
      await handleTimerInterval(
        bool_record_locations,
        initTimestamp,
        lastTimestamp,
        setActiveTime,
        setPassiveTime,
        setTotalTime,
        setLastTimestamp,
        setInitTimestamp
      );
    }, 1000);
  
    return () => {
      clearInterval(handleInterval);
    };
  }, [bool_record_locations, initTimestamp, lastTimestamp]);
  

  // useEffect appending updated location to arr_location_history
  useEffect(() => {
    //console.log("current_location:",current_location)
    const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
    
    // if recording is enabled and timestamp is different from last timestamp, then append to arr_location_history
    if (current_location["timestamp"] !== lastTimestamp && bool_record_locations) {
      arr_location_history.push(current_location);
      if (arr_location_history.length%2==0)
      {
          setscreenText("Num of locations:"+arr_location_history.length);
      }
    }
    // deal with current_location["accuracy"] info here


  }, [current_location]);

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
      <StatusBar style="auto" />
      <BT_Circle_Text_GPS renderBool={true} top="8%" left="4%"/>

      {/*meter error*/}
      <Circle_Text_Error renderBool={true} 
                         dispVal={current_location["coords"]["accuracy"]} 
                         floatVal={current_location["coords"]["accuracy"]}
                         tresholds={[7, 12, 19]} top="5%" left="25%"
                         afterText='mt'beforeText='e:'/>
      {/*current time*/}
      <Circle_Text_Error renderBool={true} 
                         dispVal={getFormattedDateTime("dateclock")}
                         floatVal={-1}
                         tresholds={[2, 4, 6]} top="5%" left="75%"
                         afterText='' beforeText=''/>
                         
      <Circle_Text_Error renderBool={true} 
                         dispVal={current_location["coords"]["latitude"]} 
                         floatVal={current_location["coords"]["accuracy"]}
                         tresholds={[7, 12, 19]} top="30%" left="0%"
                         beforeText='Lat:' afterText=''/>
      <Circle_Text_Error renderBool={true} 
                         dispVal={current_location["coords"]["longitude"]} 
                         floatVal={current_location["coords"]["accuracy"]}
                         tresholds={[7, 12, 19]} top="30%" left="25%"
                         beforeText='Lon:' afterText=''/>
      <Circle_Text_Error renderBool={true} 
                         dispVal={current_location["coords"]["altitude"]} 
                         floatVal={current_location["coords"]["altitudeAccuracy"]}
                         tresholds={[1, 3, 5]} top="30%" left="50%"
                         beforeText='Alt:' afterText=''/>
      <DisplayData renderBool={true} top="30%" left="75%" current_location={current_location}/>

      {/*total time*/}
      <Circle_Text_Error renderBool={true} 
                         dispVal={getReadableDuration(totalTime)}
                         floatVal={-1}
                         tresholds={[2, 4, 6]} top="60%" left="0%"
                         afterText='' beforeText='Tot'/>
      {/*active time*/}
      <Circle_Text_Error renderBool={true}
                          dispVal={getReadableDuration(activeTime)}
                          floatVal={-1}
                          tresholds={[2, 4, 6]} top="60%" left="25%"
                          afterText='' beforeText='Act'/>
      {/*passive time*/}
      <Circle_Text_Error renderBool={true}
                          dispVal={getReadableDuration(passiveTime)}
                          floatVal={-1}
                          tresholds={[2, 4, 6]} top="60%" left="50%"
                          afterText='' beforeText='Pas'/>



      <View style={{alignSelf:"center", alignItems:"center", alignContent:"center", marginTop: '80%', width: '100%'}}>
          {showGPSResults(current_location, false)}
          <View>
            <Text>{screenText}</Text>
          </View>
      </View>
      <View style={style_container.container}>
        <Button disabled={!permits["mediaLibrary"] && (bool_record_locations || arr_location_history.length<=1)} onPress={() => saveToFile(arr_location_history)} title="RecordPositions" color = {this.disabled ? "#ff0000" : "#00ffff"} />
      </View>
    </View>
  );
}