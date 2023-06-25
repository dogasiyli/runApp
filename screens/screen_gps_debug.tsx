import { View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';

import { getPermits, useLocationForeground, registerBackgroundFetchAsync } from '../asyncOperations/requests';

import { INIT_TIMES, LOCATION_TRACKING, LOCATION_TRACKING_BACKGROUND, OfflineLocationData } from '../assets/constants';


import { BT_Circle_Text_GPS, Circle_Text_Error, Circle_Text_Color,
         DataAgeInSec, Circle_Image_Pace } from '../functions/display/buttons';
import { saveToFile, getFormattedDateTime, getReadableDuration } from '../asyncOperations/fileOperations';
import { style_container } from '../sheets/styles';

import { useAppState } from '../assets/stateContext';

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from '../asyncOperations/requests';
import { on_new_gps_data } from '../asyncOperations/gpsOperations';
import { handleTimerInterval, get_dist_time, format_degree_to_string } from '../asyncOperations/utils';

import { SpeedTimeInfo } from '../assets/interface_definitions';
import { update_pos_array } from '../asyncOperations/utils';


export function Screen_GPS_Debug({route}) {
  const row_tops = ["5%", "30%", "70%", "120%", "90%"];
  const insets = useSafeAreaInsets();
  const [screenText, setscreenText] = useState("No locations yet");
  const [sp_tim_inf_1, setSpeedTimeInfo_1] = useState<SpeedTimeInfo>({ s60: 0,s30: 0,s10: 0,t60: 0,t30: 0,t10: 0,});
  const [sp_tim_inf_2, setSpeedTimeInfo_2] = useState<SpeedTimeInfo>({ s60: 0,s30: 0,s10: 0,t60: 0,t30: 0,t10: 0,});
  const { permits, set_permits, 
          bool_location_background_started, set_location_background_started,
          current_location, set_current_location, 
          bool_record_locations, arr_location_history, 
          position_dict, set_position_dict,
          bool_update_locations, enable_update_locations,

          initTimestamp, setInitTimestamp,
          lastTimestamp, setLastTimestamp,
          activeTime, setActiveTime,
          passiveTime, setPassiveTime,
          totalTime, setTotalTime,
        } = useAppState();
  const prevBoolRecordLocations = useRef(bool_record_locations);
  const prevBoolUpdateLocations = useRef(bool_update_locations);      

  // Debug Screen, SpeedScreens
  const display_page_mode = route.params?.display_page_mode || '';  

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
    // Check if bool_record_locations has changed
    if (
      bool_record_locations !== prevBoolRecordLocations.current
    ) {
      // Update previous values
      prevBoolRecordLocations.current = bool_record_locations;
      let s = bool_record_locations ? "Recording locations" : "Not recording locations";
      s += bool_record_locations ? "" : bool_update_locations ? " but updating locations" : " nor updating locations";
      setscreenText(s)
    }
    // Check if  bool_update_locations has changed
    if (
      bool_update_locations !== prevBoolUpdateLocations.current
    ) {
      // Update previous values
      prevBoolUpdateLocations.current = bool_update_locations;
      setscreenText(bool_update_locations ? "Updating locations" : "Not updating locations")
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
    }, INIT_TIMES.timerUpdateMS);
  
    return () => {
      clearInterval(handleInterval);
    };
  }, [bool_record_locations, initTimestamp, lastTimestamp]);
  

  // useEffect appending updated location to arr_location_history
  useEffect(() => {
    const updateLocationHistory = async () => {
      const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
      if (current_location["timestamp"] !== lastTimestamp && bool_record_locations) {
        arr_location_history.push(current_location);
        await update_pos_array(arr_location_history, position_dict, set_position_dict);      
      }
    };
    updateLocationHistory();
  }, [current_location]);
  

  // useEffect calculations from arr_location_history
  useEffect(() => {
    // Define an inner async function and call it immediately
    (async () => {
      if (display_page_mode === 'SpeedScreens' || display_page_mode === 'Debug Screen') {
        const x60s = await get_dist_time(position_dict, 40, "seconds", false)
        const x30s = await get_dist_time(position_dict, 20, "seconds", false);
        const x10s = await get_dist_time(position_dict, 5, "seconds", false);
        setSpeedTimeInfo_1({
          s60: x60s.kmh,
          t60: x60s.time_diff,
          s30: x30s.kmh,
          t30: x30s.time_diff,
          s10: x10s.kmh,
          t10: x10s.time_diff,
        });
      }
      if (display_page_mode === 'SpeedScreens') {
        const x1km = await get_dist_time(position_dict, 100, "meters", false)
        const x500m = await get_dist_time(position_dict, 50, "meters", false);
        const x100m = await get_dist_time(position_dict, 10, "meters", false);
        setSpeedTimeInfo_2({
          s60: x1km.kmh,
          t60: x1km.time_diff,
          s30: x500m.kmh,
          t30: x500m.time_diff,
          s10: x100m.kmh,
          t10: x100m.time_diff,
        });
        //console.log("diff_arr:",position_dict.diff_arr)
        //console.log("*************")
      }
    })();
}, [current_location]);


    let content = null;
    if (display_page_mode === 'Debug Screen') {
      content = (
        <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
        <StatusBar style="auto" />
  
        {/*--------ROW 1----------*/}
        <BT_Circle_Text_GPS renderBool={true} top="8%" left="4%"/>
  
        {/*meter error*/}
        <Circle_Text_Error renderBool={true} 
                           dispVal={current_location["coords"]["accuracy"].toFixed(3)} 
                           floatVal={current_location["coords"]["accuracy"]}
                           tresholds={[7, 12, 19]} top="5%" left="25%"
                           afterText='Error(mt)'beforeText=''/>
        {/*current time*/}
        <Circle_Text_Error renderBool={true} 
                           dispVal={getFormattedDateTime("dateclock")}
                           floatVal={-1}
                           tresholds={[2, 4, 6]} top="5%" left="75%"
                           afterText='' beforeText=''/>
                           
  
        {/*--------ROW 2----------*/}
        {/*latitude, longitude, altitude*/}
        <Circle_Text_Error renderBool={true} 
                           dispVal={format_degree_to_string(current_location["coords"]["latitude"])} 
                           floatVal={current_location["coords"]["accuracy"]}
                           tresholds={[7, 12, 19]} top="30%" left="0%"
                           beforeText='' afterText='Latitude'/>
        <Circle_Text_Error renderBool={true} 
                           dispVal={format_degree_to_string(current_location["coords"]["longitude"])} 
                           floatVal={current_location["coords"]["accuracy"]}
                           tresholds={[7, 12, 19]} top="30%" left="25%"
                           beforeText='' afterText='Longtitude'/>
        <Circle_Text_Error renderBool={true} 
                           dispVal={format_degree_to_string(current_location["coords"]["altitude"])} 
                           floatVal={current_location["coords"]["altitudeAccuracy"]}
                           tresholds={[1, 3, 5]} top="30%" left="50%"
                           beforeText='' afterText='Altitude'/>
        {/*last data acquisition*/}
        <DataAgeInSec renderBool={true} top="30%" left="75%" current_location={current_location}/>
  
        {/*--------ROW 3----------*/}
        {/*total time*/}
        <Circle_Text_Color renderBool={true} 
                           dispVal={getReadableDuration(totalTime)}
                           floatVal={-1}
                           backgroundColor="rgb(200,200,200)" top="60%" left="0%"
                           afterText='Total' beforeText=''/>
        {/*active time*/}
        <Circle_Text_Color renderBool={true}
                            dispVal={getReadableDuration(activeTime)}
                            floatVal={-1}
                            backgroundColor="rgb(0,100,0)" top="60%" left="25%"
                            afterText='Active' beforeText=''/>
        {/*passive time*/}
        <Circle_Text_Color renderBool={true}
                            dispVal={getReadableDuration(passiveTime)}
                            floatVal={-1}
                            backgroundColor="#505050" top="60%" left="50%"
                            afterText='Passive' beforeText=''/>
  
  
        {/* Saved location count*/}
        <Circle_Text_Error renderBool={true}
                            dispVal={arr_location_history.length.toLocaleString()}
                            floatVal={arr_location_history.length}
                            tresholds={[10, 30, 60]} top="60%" left="75%"
                            afterText='DataPts' beforeText=''/>
  
        {/*--------ROW 4----------*/}
  
        <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s60} time_diff={sp_tim_inf_1.t60} top="110%" left="5%" beforeText={'meters'}/>
        <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s30} time_diff={sp_tim_inf_1.t30} top="110%" left="40%" beforeText={'seconds'}/>
        <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s10} time_diff={sp_tim_inf_1.t10} top="110%" left="75%" beforeText={'seconds'}/>
  
        <View style={{alignSelf:"center", alignItems:"center", alignContent:"center", marginTop: '80%', width: '100%'}}>
            <View>
              <Text>{screenText}</Text>
            </View>
        </View>
  
        <View style={style_container.container}>
          <Button disabled={!permits["mediaLibrary"] && (bool_record_locations || arr_location_history.length<=1)} onPress={() => saveToFile(arr_location_history)} title="RecordPositions" color = {this.disabled ? "#ff0000" : "#00ffff"} />
        </View>
  
        </View>
      );
    } else if (display_page_mode === 'SpeedScreens') {
      content = (
        <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
        <StatusBar style="auto" />
  
        {/*--------ROW 1----------*/}
        <BT_Circle_Text_GPS renderBool={true} top="8%" left="4%"/>
  
        {/*current time*/}
        <Circle_Text_Error renderBool={true} 
                           dispVal={getFormattedDateTime("dateclock")}
                           floatVal={-1}
                           tresholds={[2, 4, 6]} top={row_tops[0]} left="25%"
                           afterText='' beforeText=''/>
                           
        {/*last data acquisition*/}
        <DataAgeInSec renderBool={true} top={row_tops[0]} left="75%" current_location={current_location}/>
  
        {/*--------ROW 2----------*/}
        {/*total time*/}
        <Circle_Text_Color renderBool={true} 
                           dispVal={getReadableDuration(totalTime)}
                           floatVal={-1}
                           backgroundColor="rgb(200,200,200)" top={row_tops[1]} left="10%"
                           afterText='Total' beforeText=''/>
        {/*active time*/}
        <Circle_Text_Color renderBool={true}
                            dispVal={getReadableDuration(activeTime)}
                            floatVal={-1}
                            backgroundColor="rgb(0,100,0)" top={row_tops[1]} left="40%"
                            afterText='Active' beforeText=''/>
        {/*passive time*/}
        <Circle_Text_Color renderBool={true}
                            dispVal={getReadableDuration(passiveTime)}
                            floatVal={-1}
                            backgroundColor="#505050" top={row_tops[1]} left="70%"
                            afterText='Passive' beforeText=''/>
  
        {/*--------ROW 3----------*/}
        <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s60} time_diff={sp_tim_inf_1.t60} top={row_tops[2]} left="5%" beforeText={'seconds'}/>
        <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s30} time_diff={sp_tim_inf_1.t30} top={row_tops[2]} left="40%" beforeText={'seconds'}/>
        <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s10} time_diff={sp_tim_inf_1.t10} top={row_tops[2]} left="75%" beforeText={'seconds'}/>
  
        {/*--------ROW 4----------*/}
        <Circle_Image_Pace renderBool={sp_tim_inf_2 !== undefined} speed_kmh={sp_tim_inf_2.s60} time_diff={sp_tim_inf_2.t60} top={row_tops[3]} left="5%" beforeText={'meters'}/>
        <Circle_Image_Pace renderBool={sp_tim_inf_2 !== undefined} speed_kmh={sp_tim_inf_2.s30} time_diff={sp_tim_inf_2.t30} top={row_tops[3]} left="40%" beforeText={'meters'}/>
        <Circle_Image_Pace renderBool={sp_tim_inf_2 !== undefined} speed_kmh={sp_tim_inf_2.s10} time_diff={sp_tim_inf_2.t10} top={row_tops[3]} left="75%" beforeText={'meters'}/>
  
        </View>
      );
    }
    return (
      <>
        {content}
      </>
    );
}