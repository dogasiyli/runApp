import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BT_Circle_Clickable } from '../functions/display/buttons';
import { useEffect } from 'react';
import { getPermits, startBackgroundLocationTracking, stopBackgroundLocationTracking, useLocationForeground } from '../asyncOperations/requests';
import { useAppState } from '../assets/stateContext';
import { CALC_DISTANCES_FIXED, CALC_TIMES_FIXED, FIXED_DISTANCES, INIT_TIMES } from '../assets/constants';
import { handleTimerInterval } from '../asyncOperations/utils';
import { updateCalcedResults, updateDistances, updateLocationHistory, updatePosDict } from '../asyncOperations/asyncCalculations';
import { animate_point, updateMapInformation, updatePolyGroups } from '../asyncOperations/gpsOperations';
import { loadSimulationData, startStopSimulation } from '../asyncOperations/simulationOperations';

export function Screen_Home({navigation}) {
  const insets = useSafeAreaInsets();
  const { set_permits, 
          bool_record_locations, enable_record_locations,
          bool_update_locations, enable_update_locations,
          bool_location_background_started, set_location_background_started,
          arr_location_history, 
          current_location, set_current_location,
          initTimestamp, lastTimestamp, 
          simulationParams, setSimulationParams,
          setActiveTime, setPassiveTime, setTotalTime,
          setLastTimestamp, setInitTimestamp,
          pos_array_diffs, stDict, setStDict,
          pos_array_kalman, 
          pos_array_timestamps, set_pos_array_timestamps,
          setCoveredDistance,
          mapRef, mapData, setMapData, 
          runState,

  } = useAppState();

  // useEffect for getting permissions
  useEffect (() => {
    const _getPermits = async () => {
      const _permits = await getPermits('locationForeGround,locationBackGround,mediaLibrary');
      set_permits(_permits);
    }
    _getPermits()
    .catch(console.error);
  }, [])

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


  // useEffect for handling timeIntervals
  useEffect(() => {
    const calcTimes = async () => {
      await handleTimerInterval(
        bool_record_locations,
        initTimestamp,
        lastTimestamp,
        simulationParams,
        setActiveTime,
        setPassiveTime,
        setTotalTime,
        setLastTimestamp,
        setInitTimestamp
      );
    };
    calcTimes();
  }, [bool_record_locations, simulationParams.isPaused, current_location, initTimestamp]);

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


  // useEffect appending updated location to arr_location_history
  useEffect(() => {
    const fetchData = async () => {
      //console.log("try fetchData ", isCalculating, bool_record_locations);
      if ((bool_record_locations || !simulationParams.isPaused) && (current_location.coords.accuracy < FIXED_DISTANCES["ALLOWED_COORD_ACCURACY"])) {
        await updateLocationHistory(arr_location_history, (bool_record_locations || !simulationParams.isPaused), current_location);
        await updatePosDict(arr_location_history, pos_array_kalman, pos_array_diffs, 
                            pos_array_timestamps, set_pos_array_timestamps, current_location);
        await updateDistances(arr_location_history, (bool_record_locations || !simulationParams.isPaused), pos_array_diffs, current_location, setCoveredDistance);
      } 
      else if (current_location.coords.accuracy >= FIXED_DISTANCES["ALLOWED_COORD_ACCURACY"])
      {
        //console.log("skip gps loc - accuracy is too low: ", current_location.coords.accuracy);
      }
      else {
        //console.log("CANCEL CALCULATING");
      }
    };
  
    fetchData();
  
    return () => {
      // Cleanup function
    };
  }, [current_location]);

  // useEffect calculations from arr_location_history
  // important to decide when to update when not to update
  useEffect(() => {
    let isMounted = true;
    // Define an inner async function and call it immediately
    (async () => {
      //console.log("++++++++++++++++")      
      //console.log("stDict:",stDict, stDict_hasKey(stDict, "noesence"))


      // update only if recording is enabled or simulation is started
      const run_updates = bool_record_locations || !simulationParams.isPaused || simulationParams.index>0;
      const _calc_times = true; //display_page_mode === 'SpeedScreens' || display_page_mode === 'SimulateScreen' || display_page_mode === 'Debug Screen';
      const _calc_dists = true; //display_page_mode === 'SpeedScreens' || display_page_mode === 'SimulateScreen' || display_page_mode === 'PaceBlockScreen';
      
      if (isMounted && run_updates && _calc_times) {
        await updateCalcedResults(pos_array_diffs, stDict, setStDict, "time", CALC_TIMES_FIXED[0]);
        await updateCalcedResults(pos_array_diffs, stDict, setStDict, "time", CALC_TIMES_FIXED[1]);
        await updateCalcedResults(pos_array_diffs, stDict, setStDict, "time", CALC_TIMES_FIXED[2]);

      }
      if (isMounted && run_updates && _calc_dists) {
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

  //MAP PAGE USE_EFFECTS
  useEffect(() => {
    updateMapInformation(mapData, setMapData, bool_record_locations, simulationParams, current_location);
  }, [current_location]);

  //when to animate map
  useEffect(() => {
    animate_point(runState, simulationParams, mapData, mapRef, current_location);
  }, [mapData.viewProps, current_location, mapData.loc_boundaries]);  

  useEffect(() => {
    //console.log("mapData.locations.length changed to:", mapData.locations.length);
    if (mapData.locations.length < 2) 
      return;
    updatePolyGroups(mapData, setMapData);
  }, [mapData.locations]);
  
  //SIMULATION USE_EFFECTS
    // useEffect appending updated location to arr_location_history
    useEffect(() => {
      loadSimulationData(simulationParams, setSimulationParams);
      return () => {/*Cleanup function*/};
    }, [simulationParams.selected]);

    useEffect(() => {
      startStopSimulation(simulationParams, setSimulationParams, set_current_location);
    }, [simulationParams.isPaused]);
  
  return (
    <>
    <StatusBar backgroundColor="white" style="auto" />
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
      <BT_Circle_Clickable renderBool={true} top="10%" left="10%" size_perc={0.25} nav={navigation} page_name="GPS Debug" page_navigate_str="GPS_Debug" display_page_mode="Debug Screen" />
      <BT_Circle_Clickable renderBool={true} top="10%" left="40%" size_perc={0.25} nav={navigation} page_name="Moving Pts" page_navigate_str="Moveable_Points" />
      <BT_Circle_Clickable renderBool={true} top="10%" left="70%" size_perc={0.25} nav={navigation} page_name="Screen Stack" page_navigate_str="Screen_Navigation" />
      <BT_Circle_Clickable renderBool={true} top="40%" left="10%" size_perc={0.25} nav={navigation} page_name="Speeds" page_navigate_str="GPS_Debug" display_page_mode="SpeedScreens"  />
      <BT_Circle_Clickable renderBool={true} top="40%" left="40%" size_perc={0.25} nav={navigation} page_name="Maps" page_navigate_str="GPS_Debug" display_page_mode="MapScreen"  />
      <BT_Circle_Clickable renderBool={true} top="40%" left="70%" size_perc={0.25} nav={navigation} page_name="Simulate" page_navigate_str="GPS_Debug" display_page_mode="SimulateScreen"  />
      <BT_Circle_Clickable renderBool={true} top="70%" left="10%" size_perc={0.25} nav={navigation} page_name="Interval" page_navigate_str="GPS_Debug" display_page_mode="PaceBlockScreen"  />
    </View>
    </>
  );
}