import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';

import { getPermits, useLocationForeground, registerBackgroundFetchAsync } from '../asyncOperations/requests';

import { INIT_TIMES, LOCATION_TRACKING, LOCATION_TRACKING_BACKGROUND, OfflineLocationData } from '../assets/constants';


import { getFormattedDateTime } from '../asyncOperations/fileOperations';

import { DebugScreen } from './screen_gps_dbg';
import { SpeedScreen } from './screen_gps_speeds';

import { useAppState } from '../assets/stateContext';

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from '../asyncOperations/requests';
import { on_new_gps_data } from '../asyncOperations/gpsOperations';
import { handleTimerInterval, get_dist_time, initialize_post_dict } from '../asyncOperations/utils';

import { SpeedTimeInfo } from '../assets/interface_definitions';
import { CoveredDistance } from '../assets/types';
import { updateLocationHistory } from '../asyncOperations/asyncCalculations';


export function Screen_GPS_Debug({route}) {
  const insets = useSafeAreaInsets();
  const [screenText, setscreenText] = useState("No locations yet");
  const [isCalculating, setIsCalculating] = useState(false);
  const [sp_tim_inf_1, setSpeedTimeInfo_1] = useState<SpeedTimeInfo>({ s60: 0,s30: 0,s10: 0,t60: 0,t30: 0,t10: 0,});
  const [sp_tim_inf_2, setSpeedTimeInfo_2] = useState<SpeedTimeInfo>({ s60: 0,s30: 0,s10: 0,t60: 0,t30: 0,t10: 0,});
  const [coveredDistance, setCoveredDistance] = useState<CoveredDistance>({   distance_all: 0,distance_last: 0,time_diff_last: 0,dist_to_start: 0});
  const { set_permits, 
          bool_location_background_started, set_location_background_started,
          current_location, set_current_location, 
          bool_record_locations, arr_location_history, 
          position_dict, set_position_dict,
          bool_update_locations, enable_update_locations,
          initTimestamp, setInitTimestamp,
          lastTimestamp, setLastTimestamp,
          setActiveTime, setPassiveTime, setTotalTime,
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
    const update_async = async (pd:any) => {
      console.log("*-+*-+set_position_dict...");
      set_position_dict(pd);
    };
    const fetchData = async (pd:any) => {
      console.log("try fetchData ", isCalculating, bool_record_locations);
      if (!isCalculating && bool_record_locations) {
        setIsCalculating(true);

        const pos_dict = await updateLocationHistory(arr_location_history, bool_record_locations, pd, current_location, setCoveredDistance);
        
        await update_async(pos_dict);  

        setIsCalculating(false);
      } else {
        console.log("CANCEL CALCULATING");
      }
    };
  
    fetchData(position_dict);
  
    return () => {
      // Cleanup function
    };
  }, [current_location]);


  // useEffect calculations from arr_location_history
  useEffect(() => {
    let isMounted = true;
    // Define an inner async function and call it immediately
    (async () => {
      if (isMounted && bool_record_locations && (display_page_mode === 'SpeedScreens' || display_page_mode === 'Debug Screen')) {
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
      if (isMounted && bool_record_locations && display_page_mode === 'SpeedScreens') {
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

    return () => {
      // Cleanup function to cancel any pending asynchronous operations
      isMounted = false;
    };    
}, [current_location]);


    let content = null;
    if (display_page_mode === 'Debug Screen') {
      content = <DebugScreen insets={insets} sp_tim_inf_1={sp_tim_inf_1} screenText={screenText}/>;
    } else if (display_page_mode === 'SpeedScreens') {
      content = <SpeedScreen insets={insets} sp_tim_inf_1={sp_tim_inf_1} sp_tim_inf_2={sp_tim_inf_2} covered_dist={coveredDistance}/>;
    }
    return (
      <>
        {content}
      </>
    );
}