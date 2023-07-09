import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';

import { getPermits, useLocationForeground, registerBackgroundFetchAsync } from '../asyncOperations/requests';

import { INIT_TIMES, LOCATION_TRACKING, LOCATION_TRACKING_BACKGROUND } from '../assets/constants';


import { getFormattedDateTime } from '../asyncOperations/fileOperations';

import { DebugScreen } from './screen_gps_dbg';
import { SpeedScreen } from './screen_gps_speeds';
import { MapScreen } from './screen_gps_maps'
import { SimulateScreen } from './screen_gps_simulate';

import { useAppState } from '../assets/stateContext';

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from '../asyncOperations/requests';
import { isLocationFarEnough, on_new_gps_data } from '../asyncOperations/gpsOperations';
import { handleTimerInterval, } from '../asyncOperations/utils';

import { CoveredDistance, SpeedTimeCalced_Dict } from '../assets/types';
import { updateLocationHistory, updatePosDict, updateDistances, updateCalcedResults } from '../asyncOperations/asyncCalculations';
import { CALC_TIMES_FIXED, CALC_DISTANCES_FIXED } from '../assets/constants';
import { resetSimulation } from '../asyncOperations/resetOperations';

export function Screen_GPS_Debug({route}) {
  const ALLOWED_COORD_ACCURACY = 15;
  const sims_all =
  {
    'circleRun': require('../assets/plottable_run_examples/runPositions_20230526_123109_circleRun.json'),
    'walk01': require('../assets/plottable_run_examples/runPositions_20230702_092833_walk01.json'),
    'BFFast': require('../assets/plottable_run_examples/runPositions_20230705_204451_BFFast.json'),
    'BFWarm': require('../assets/plottable_run_examples/runPositions_20230705_202354_BFWarm.json'),
    'garminpace13': require('../assets/plottable_run_examples/runPositions_20230525_062510_garminpace13.json'),
  }

  const insets = useSafeAreaInsets();
  const [screenText, setscreenText] = useState("No locations yet");

  const [stDict, setStDict] = useState<SpeedTimeCalced_Dict>({});
  
  const [coveredDistance, setCoveredDistance] = useState<CoveredDistance>({   distance_all: 0,distance_last: 0,time_diff_last: 0,dist_to_start: 0});
  const { set_permits, 
          bool_location_background_started, set_location_background_started,
          current_location, set_current_location, 
          bool_record_locations, enable_record_locations, arr_location_history, 
          
          pos_array_kalman,
          pos_array_diffs,
          pos_array_timestamps, set_pos_array_timestamps,
          
          bool_update_locations, enable_update_locations,
          initTimestamp, setInitTimestamp,
          lastTimestamp, setLastTimestamp,
          setActiveTime, setPassiveTime, setTotalTime,

          mapData, setMapData,
          simulationParams, setSimulationParams,
          runState, setRunState,
          set_location_history, set_pos_array_kalman, set_pos_array_diffs
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


  // Use effect for handling gps update informations
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
    const fetchData = async () => {
      //console.log("try fetchData ", isCalculating, bool_record_locations);
      if ((bool_record_locations || !simulationParams.isPaused) && (current_location.coords.accuracy < ALLOWED_COORD_ACCURACY)) {
        await updateLocationHistory(arr_location_history, (bool_record_locations || !simulationParams.isPaused), current_location);
        await updatePosDict(arr_location_history, pos_array_kalman, pos_array_diffs, 
                            pos_array_timestamps, set_pos_array_timestamps, current_location);
        await updateDistances(arr_location_history, (bool_record_locations || !simulationParams.isPaused), pos_array_diffs, current_location, setCoveredDistance);
      } 
      else if (current_location.coords.accuracy >= ALLOWED_COORD_ACCURACY)
      {
        console.log("skip gps loc - accuracy is too low: ", current_location.coords.accuracy);
      }
      else {
        console.log("CANCEL CALCULATING");
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
      const _calc_times = display_page_mode === 'SpeedScreens' || display_page_mode === 'SimulateScreen' || display_page_mode === 'Debug Screen';
      const _calc_dists = display_page_mode === 'SpeedScreens' || display_page_mode === 'SimulateScreen';
      
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

  //MAP PAGE USE_EFFECTS
  useEffect(() => {
    if (current_location && current_location.coords) {
      const { latitude, longitude } = current_location.coords;
  
      const checkLocation = async () => {
        const isFarEnough = await isLocationFarEnough(
          { latitude, longitude },
          mapData.locations
        );
        const isToBeAdded = bool_record_locations || !simulationParams.isPaused;
  
        if (isFarEnough && isToBeAdded) {
          setMapData((prevState) => ({
            ...prevState,
            locations: [...prevState.locations, { latitude, longitude }],
          }));
        }
  
        setMapData((prevMapData) => ({
          ...prevMapData,
          region: {
            ...prevMapData.region,
            latitude,
            longitude,
          },
        }));
      };
  
      checkLocation();
    }
  }, [current_location]);
  

  //SIMULATION USE_EFFECTS
    // useEffect appending updated location to arr_location_history
    useEffect(() => {
      const fetchData = async () => {
        //console.log("selectedSimulation changed to(", simulationParams.selected, "), simulationParams.index(", simulationParams.index ,")")                 
          if (simulationParams.index=== -1) {
            console.log("Loading simulation data:", simulationParams.selected);
            // Parse the JSON data from the file
            let parsedData = sims_all[simulationParams.selected];
            console.log("Loaded simulation data. Type:", typeof parsedData);
            console.log("Length of positions:", parsedData.length);
            if (parsedData[0]["timestamp"] !== undefined && parsedData[0]["timestamp"] !== 0) {
              parsedData = parsedData.slice(1, parsedData.length)
              console.log("Removed first element of positions:", parsedData.length);
            }
            setSimulationParams((prevParams) => ({
              ...prevParams,
              gpsDataArray: parsedData,
            }));
        }
      };
    
      fetchData();
    
      return () => {
        // Cleanup function
      };
    }, [simulationParams.selected]);

    useEffect(() => {
      //console.log("++++++++++++++++simulationParams.isPaused:", simulationParams.isPaused);
      //console.log("++++++++++++++++simulationParams.timestampOffset:", simulationParams.timestampOffset);
      if (!simulationParams.isPaused) {
          // Resume the simulation
          enableSimulation(simulationParams.index+1);
      } 
      //else if (!simulationParams.isPaused && simulationParams.timestampOffset>0) {console.log(":::::::::::::::JUST PAGE IS REOPENED-simulationParams.timestampOffset:", simulationParams.timestampOffset);}
      else {
          // Pause the simulation
          //console.log("pauseSimUseEffect:", simulationParams.isPaused);
          clearInterval(simulationParams.interval);
          setSimulationParams((prevParams) => ({
            ...prevParams,
            interval: null,
          }));
      }
    }, [simulationParams.isPaused]);

    const startSim = () => {
      console.log("0.started simulation adding first gps data array with set_current_location");
      setSimulationParams((prevParams) => ({
        ...prevParams,
        timestampOffset: 0,
      }));
      set_current_location(simulationParams.gpsDataArray[0]); 
      console.log("simulationParams.gpsDataArray[0]:\n", simulationParams.gpsDataArray[0]);   
    }
    const endSim = () => {
      console.log("endSim: simulationParams.isPaused:", simulationParams.isPaused);
      clearInterval(simulationParams.interval);
      setSimulationParams((prevParams) => ({
        ...prevParams,
        interval: null,
        isPaused: true,
      }));
    }
    const enableSimulation = (initIndex: number) => {
      let currentIndex = initIndex;
      console.log("??????????????startSimulation: currentIndex:", currentIndex);
    
      // Clear the previous interval if it exists
      if (simulationParams.interval) {
        clearInterval(simulationParams.interval);
      }
    
      // Update current location at a fixed interval (X seconds in this case)
      const interval = setInterval(() => {
        const prevIndex = currentIndex - 1;
    
        if (currentIndex === 0) {
          startSim();
          currentIndex = 1;
        } else if (
          currentIndex === simulationParams.gpsDataArray.length ||
          simulationParams.isPaused
        ) {
          // Reached the end of the array or paused, stop the simulation
          endSim();
          return;
        } else {
          const difTimeStep =
            simulationParams.gpsDataArray[currentIndex].timestamp -
            simulationParams.gpsDataArray[prevIndex].timestamp;
    
          set_current_location(simulationParams.gpsDataArray[currentIndex]);
          currentIndex = currentIndex + 1;
          setSimulationParams((prevParams) => ({
            ...prevParams,
            index: currentIndex - 1,
            timestampOffset: prevParams.timestampOffset + difTimeStep,
            interval: interval,
          }));
        }
      }, simulationParams.stepSelected);
    
      // Store the interval reference
      setSimulationParams((prevParams) => ({
        ...prevParams,
        interval: interval,
      }));
    };
    

    let content = null;
    if (display_page_mode === 'Debug Screen') {
      content = <DebugScreen insets={insets} stDict={stDict} screenText={screenText}/>;
    } else if (display_page_mode === 'SpeedScreens') {
      content = <SpeedScreen insets={insets} stDict={stDict} covered_dist={coveredDistance}/>;
    }else if (display_page_mode === 'MapScreen') {
      content = <MapScreen insets={insets}/>;
    }else if (display_page_mode === 'SimulateScreen') {
      content = <SimulateScreen insets={insets}/>;
    }
    return (
      <>
        {content}
      </>
    );
}