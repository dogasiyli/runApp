import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';

import { getPermits, useLocationForeground, registerBackgroundFetchAsync } from '../asyncOperations/requests';

import { INIT_TIMES, LOCATION_TRACKING, LOCATION_TRACKING_BACKGROUND } from '../assets/constants';


import { getFormattedDateTime } from '../asyncOperations/fileOperations';

import { DebugScreen } from './screen_gps_dbg';
import { SpeedScreen } from './screen_gps_speeds';
import { MapScreen } from './screen_gps_maps'

import { useAppState } from '../assets/stateContext';

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from '../asyncOperations/requests';
import { on_new_gps_data } from '../asyncOperations/gpsOperations';
import { handleTimerInterval, } from '../asyncOperations/utils';

import { CoveredDistance, SpeedTimeCalced_Dict } from '../assets/types';
import { updateLocationHistory, updatePosDict, updateDistances, updateCalcedResults } from '../asyncOperations/asyncCalculations';
import { CALC_TIMES_FIXED, CALC_DISTANCES_FIXED } from '../assets/constants';

export function Screen_GPS_Debug({route}) {
  const insets = useSafeAreaInsets();
  const [screenText, setscreenText] = useState("No locations yet");
  const [isCalculating, setIsCalculating] = useState(false);

  const [stDict, setStDict] = useState<SpeedTimeCalced_Dict>({});
  
  const [coveredDistance, setCoveredDistance] = useState<CoveredDistance>({   distance_all: 0,distance_last: 0,time_diff_last: 0,dist_to_start: 0});
  const { set_permits, 
          bool_location_background_started, set_location_background_started,
          current_location, set_current_location, 
          bool_record_locations, enable_record_locations, arr_location_history, 
          
          pos_array_kalman, set_pos_array_kalman, 
          pos_array_diffs, set_pos_array_diffs, 
          pos_array_timestamps, set_pos_array_timestamps,
          
          bool_update_locations, enable_update_locations,
          initTimestamp, setInitTimestamp,
          lastTimestamp, setLastTimestamp,
          setActiveTime, setPassiveTime, setTotalTime,

          runState,
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
    const fetchData = async () => {
      //console.log("try fetchData ", isCalculating, bool_record_locations);
      if (bool_record_locations) {
        await updateLocationHistory(arr_location_history, bool_record_locations, current_location);
        await updatePosDict(arr_location_history, pos_array_kalman, pos_array_diffs, 
                            pos_array_timestamps, set_pos_array_timestamps, current_location);
        await updateDistances(arr_location_history, bool_record_locations, pos_array_diffs, current_location, setCoveredDistance);
      } else {
        console.log("CANCEL CALCULATING");
      }
    };
  
    fetchData();
  
    return () => {
      // Cleanup function
    };
  }, [current_location]);


  // useEffect calculations from arr_location_history
  useEffect(() => {
    let isMounted = true;
    // Define an inner async function and call it immediately
    (async () => {
      //console.log("++++++++++++++++")      
      //console.log("stDict:",stDict, stDict_hasKey(stDict, "noesence"))
      if (isMounted && bool_record_locations && (display_page_mode === 'SpeedScreens' || display_page_mode === 'Debug Screen')) {
        await updateCalcedResults(pos_array_diffs, stDict, setStDict, "time", CALC_TIMES_FIXED[0]);
        await updateCalcedResults(pos_array_diffs, stDict, setStDict, "time", CALC_TIMES_FIXED[1]);
        await updateCalcedResults(pos_array_diffs, stDict, setStDict, "time", CALC_TIMES_FIXED[2]);

      }
      if (isMounted && bool_record_locations && display_page_mode === 'SpeedScreens') {
        await updateCalcedResults(pos_array_diffs, stDict, setStDict, "distance", CALC_DISTANCES_FIXED[0]);
        await updateCalcedResults(pos_array_diffs, stDict, setStDict, "distance", CALC_DISTANCES_FIXED[1]);
        await updateCalcedResults(pos_array_diffs, stDict, setStDict, "distance", CALC_DISTANCES_FIXED[2]);
      }
      //console.log(stDict)
    })();

    return () => {
      // Cleanup function to cancel any pending asynchronous operations
      isMounted = false;
    };    
}, [current_location]);

  // useEffect appending updated location to arr_location_history
  useEffect(() => {
    //console.log("runState:",runState)
    if (runState==="paused" || runState==="stopped")
    { 
      enable_record_locations(false);
    }
    if (runState==="running")
    { 
      enable_update_locations(true);
      enable_record_locations(true);
    }
  }, [runState]);

    let content = null;
    if (display_page_mode === 'Debug Screen') {
      content = <DebugScreen insets={insets} stDict={stDict} screenText={screenText}/>;
    } else if (display_page_mode === 'SpeedScreens') {
      content = <SpeedScreen insets={insets} stDict={stDict} covered_dist={coveredDistance}/>;
    }else if (display_page_mode === 'MapScreen') {
      content = <MapScreen insets={insets}/>;
    }
    return (
      <>
        {content}
      </>
    );
}