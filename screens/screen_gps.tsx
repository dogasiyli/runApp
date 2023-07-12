import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';

import { getPermits, useLocationForeground, registerBackgroundFetchAsync } from '../asyncOperations/requests';

import { FIXED_DISTANCES, INIT_TIMES, LOCATION_TRACKING, LOCATION_TRACKING_BACKGROUND, latDelta_min, lonDelta_min } from '../assets/constants';
import { IMapBoundaries, IMapRegion } from '../assets/interface_definitions';


import { getFormattedDateTime } from '../asyncOperations/fileOperations';

import { DebugScreen } from './screen_gps_dbg';
import { SpeedScreen } from './screen_gps_speeds';
import { MapScreen } from './screen_gps_maps'
import { SimulateScreen } from './screen_gps_simulate';
import { PaceBlockScreen } from './screen_gps_paceblocks';

import { useAppState } from '../assets/stateContext';

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { startBackgroundLocationTracking, stopBackgroundLocationTracking } from '../asyncOperations/requests';
import { isLocationFarEnough, isFurtherThan, on_new_gps_data, animate_point } from '../asyncOperations/gpsOperations';
import { calc_run_params, handleTimerInterval, } from '../asyncOperations/utils';

import { CoveredDistance, SpeedTimeCalced_Dict, stDict_hasKey } from '../assets/types';
import { updateLocationHistory, updatePosDict, updateDistances, updateCalcedResults } from '../asyncOperations/asyncCalculations';
import { CALC_TIMES_FIXED, CALC_DISTANCES_FIXED } from '../assets/constants';
import { resetSimulation } from '../asyncOperations/resetOperations';

export function Screen_GPS_Debug({route}) {
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

          mapRef, mapData, setMapData,
          simulationParams, setSimulationParams,
          runState, setRunState,
          set_location_history, set_pos_array_kalman, set_pos_array_diffs,
          paceBlock, setPaceBlock,
          stDict, setStDict,
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
      if ((bool_record_locations || !simulationParams.isPaused) && (current_location.coords.accuracy < FIXED_DISTANCES["ALLOWED_COORD_ACCURACY"])) {
        await updateLocationHistory(arr_location_history, (bool_record_locations || !simulationParams.isPaused), current_location);
        await updatePosDict(arr_location_history, pos_array_kalman, pos_array_diffs, 
                            pos_array_timestamps, set_pos_array_timestamps, current_location);
        await updateDistances(arr_location_history, (bool_record_locations || !simulationParams.isPaused), pos_array_diffs, current_location, setCoveredDistance);
      } 
      else if (current_location.coords.accuracy >= FIXED_DISTANCES["ALLOWED_COORD_ACCURACY"])
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
      const _calc_dists = display_page_mode === 'SpeedScreens' || display_page_mode === 'SimulateScreen' || display_page_mode === 'PaceBlockScreen';
      
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
        const set_new_bounds = async(newBounds:IMapBoundaries, latitude, longitude) => {
          newBounds.lat_max = Math.max(newBounds.lat_max, latitude);
          newBounds.lat_min = Math.min(newBounds.lat_min, latitude);
          newBounds.lon_max = Math.max(newBounds.lon_max, longitude);
          newBounds.lon_min = Math.min(newBounds.lon_min, longitude);
          newBounds.lat_delta = Math.max(newBounds.lat_max - newBounds.lat_min, latDelta_min);
          newBounds.lon_delta = Math.max(newBounds.lon_max - newBounds.lon_min, lonDelta_min);   
          return newBounds;       
        }
        const set_new_region = async(newRegion:IMapRegion, newBounds:IMapBoundaries, latitude:number, longitude:number) => {
          //newRegion.latitudeDelta = 2*newBounds.lat_delta;
          //newRegion.longitudeDelta = 2*newBounds.lon_delta;
          newRegion.latitude = latitude;
          newRegion.longitude = longitude;      
          return newRegion;     
        }
        const isToBeAdded = bool_record_locations || !simulationParams.isPaused;
  
        let newBounds = {...mapData.loc_boundaries};
        let newRegion = {
          ...mapData.region,
          latitude: latitude,
          longitude: longitude,
        };
        if (isFarEnough && isToBeAdded) {
          // add the location to the map

          newBounds = await set_new_bounds(newBounds, latitude, longitude);
          //console.log("newBounds:", newBounds);

          newRegion = await set_new_region(newRegion, newBounds, latitude, longitude);
          //console.log("newRegion:", newRegion); 

          setMapData((prevState) => ({
            ...prevState,
            locations: [...prevState.locations, { latitude, longitude }],
            loc_boundaries: newBounds,
            region: newRegion,
          }));
        }
      };
  
      checkLocation();
    }
  }, [current_location]);

  //when to animate map
  useEffect(() => {
      const animateMap = async () => {          
          await animate_point(runState, simulationParams, mapData, mapRef, current_location);
      }
      animateMap();
    }, [mapData.viewProps, current_location, mapData.loc_boundaries]);  

  useEffect(() => {
    //console.log("mapData.locations.length changed to:", mapData.locations.length);
    if (mapData.locations.length < 2) 
      return;
    
    const isTooFar = async (polyGroupCount:number) => {
      //console.log("---isTooFar---polyGroupCount(", polyGroupCount, ')');
      if (polyGroupCount<1) return false;

      //console.log("---isTooFar---isFurtherThan:polyGroupCount(", polyGroupCount, '):', mapData.polyGroup[polyGroupCount-1].to, mapData.locations.length);
      const tooFar2BeInTheSameGroup = await isFurtherThan(
        mapData.locations[mapData.polyGroup[polyGroupCount-1].to],
        mapData.locations, FIXED_DISTANCES["POLY_GROUP_MAX_WITHIN_DISTANCE"]
      );
      //console.log("---isTooFar---tooFar2BeInTheSameGroup:polyGroupCount(", polyGroupCount, '):', tooFar2BeInTheSameGroup);

      return tooFar2BeInTheSameGroup;
    };


    const runAsyncStuff = async () => {
      const polyGroupCount =  mapData.polyGroup.length;
      const tooFar2BeInTheSameGroup = await isTooFar(polyGroupCount);
      const map_loc_last = mapData.locations.length-1;
      //TODO check if the activity type is passed from current location etc.
      const known_activityType_last =  mapData.locations[map_loc_last-1]?.activityType ? mapData.locations[map_loc_last-1]?.activityType : undefined;
      const known_activityType_curr =  mapData.locations[map_loc_last]?.activityType ? mapData.locations[map_loc_last]?.activityType : undefined;
      let last_activityType =  polyGroupCount>0 ? mapData.polyGroup[polyGroupCount-1].actType : (known_activityType_last===undefined ? "run": known_activityType_last);
      let curr_activityType =  known_activityType_curr===undefined ? "run": known_activityType_curr;

      if (mapData.locations.length == 2) {
        //console.log("mapData.locations.length == 2")
        setMapData((prevState) => ({
          ...prevState,
          polyGroup: [...prevState.polyGroup, { from: 0, to: 1, actType: curr_activityType }],
        }));
        //console.log("11111111-BEG-mapData.polyGroup:\n", mapData.polyGroup);
        return;
      }

      curr_activityType = tooFar2BeInTheSameGroup ? "pause" : curr_activityType;
      //console.log("tooFar2BeInTheSameGroup:", tooFar2BeInTheSameGroup, ", curr_activityType:", curr_activityType, ", last_activityType:", last_activityType);
      if (curr_activityType==last_activityType)
      {
        mapData.polyGroup[polyGroupCount-1].to = map_loc_last;
        //console.log("2222222-INC-mapData.polyGroup:\n", mapData.polyGroup);
      }
      else
      {
        setMapData((prevState) => ({
          ...prevState,
          polyGroup: [...prevState.polyGroup, { from: map_loc_last-1, to: map_loc_last, actType: curr_activityType }],
        }));
        //console.log("33333333-APP-mapData.polyGroup:\n", mapData.polyGroup);
      }
    }

    runAsyncStuff();
 
  }, [mapData.locations]);
  

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

    //PACE BLOCKS
    useEffect(() => {
      const initialize_pace_blocks_array = async () => {
        console.log("paceBlock.initial_index===0 && paceBlock.paceBlocks.length===0")
        paceBlock.paceBlocks.push({init:pos_array_diffs.length, last:pos_array_diffs.length, pace:0, dist:0, time:0, block_type:"unknown"});
      }
      //get_block_type(paceBlock.paceBlocks[block_id].pace, stDict["50m"].last_pace)
      const get_block_type = async (cur_pace:number, pace_50m:number, last_block_type:string) => {
        const pace_acceptable_error = 0.1;
        const faster_pace_pick = Math.min(cur_pace, pace_50m);

        console.log("cur_pace:", cur_pace, ", pace_50m:", pace_50m, ", faster_pace_pick:", faster_pace_pick)
        
        const new_block_type = faster_pace_pick<paceBlock.paceBlockTreshold_fast.pace ? "fast" : 
                               (faster_pace_pick>paceBlock.paceBlockTreshold_slow.pace ? "slow" : "normal");

        if (last_block_type!==new_block_type)
        {
          // accept the new block type only if the pace is different by more than pace_acceptable_error
          if (new_block_type==="fast")
          {
            if (Math.abs(faster_pace_pick-paceBlock.paceBlockTreshold_fast.pace) < pace_acceptable_error)
            {
              console.log("************keep last_block_type1:", last_block_type)
              return String(last_block_type);
            }
          }
          else if (new_block_type==="slow")
          {
            if (Math.abs(faster_pace_pick-paceBlock.paceBlockTreshold_slow.pace) < pace_acceptable_error)
            {
              console.log("************keep last_block_type2:", last_block_type)
              return String(last_block_type);
            }
          }
          else if (new_block_type==="normal")
          {
            if (last_block_type==="fast")
            {
              if (Math.abs(faster_pace_pick-paceBlock.paceBlockTreshold_fast.pace) < pace_acceptable_error)
              {
                console.log("************keep last_block_type3:", last_block_type)
                return String(last_block_type);
              }  
            }
            else if (last_block_type==="slow")
            {
              if (Math.abs(faster_pace_pick-paceBlock.paceBlockTreshold_slow.pace) < pace_acceptable_error)
              {
                console.log("************keep last_block_type4:", last_block_type)
                return String(last_block_type);
              }  
            }
          }
        }
        
        console.log("paceBlock.paceBlockTreshold_fast.pace:", paceBlock.paceBlockTreshold_fast.pace, ", new_block_type:", new_block_type)
        
        return String(new_block_type);
      }
      if (paceBlock.initial_index===-1)
      {
        console.log("paceBlock.initial_index===-1")
        return;
      }
      if (paceBlock.paceBlocks.length===0)
      {
        initialize_pace_blocks_array();
        return;
      }
      if (paceBlock.paceBlocks.length===1 && paceBlock.paceBlocks[0].block_type==="unknown")
      {
        console.log("havent set the first block yet. check last 50 meter pace")
        if (stDict_hasKey(stDict, "50m"))
          console.log("50m pace:", stDict["50m"].last_pace)
        else
        {
          console.log("50m pace: not yet calculated")
          return;
        }
      }
      //1. first block needs to be set after at least 50 meters of running
      //   we will check the last 50 meters of the run params
      const pos_arr_last = pos_array_diffs.length-1;
      if (paceBlock.paceBlocks.length===1 && paceBlock.paceBlocks[0].block_type==="unknown" && stDict_hasKey(stDict, "50m"))
      {
        if (stDict["50m"].last_pace>0)
        {
          console.log("50m pace:", stDict["50m"].last_pace)
          console.log("set the first block first time")
          paceBlock.paceBlocks[0].pace = stDict["50m"].last_pace;
          paceBlock.paceBlocks[0].dist = stDict["50m"].last_dist;
          paceBlock.paceBlocks[0].time = stDict["50m"].last_time;
          paceBlock.paceBlocks[0].last = pos_arr_last;
          paceBlock.paceBlocks[0].block_type = stDict["50m"].last_pace<paceBlock.paceBlockTreshold_fast.pace ? "fast" : 
                                              (stDict["50m"].last_pace>paceBlock.paceBlockTreshold_slow.pace ? "slow" : "normal");
          console.log("paceBlock.paceBlocks[0]:", paceBlock.paceBlocks[0])
        }
        return;
      }
      //2. check if the last block is still the same
      const block_id = paceBlock.paceBlocks.length-1;
      get_block_type(paceBlock.paceBlocks[block_id].pace, stDict["50m"].last_pace, paceBlock.paceBlocks[block_id].block_type)
      .then((new_block_type) => {
        console.log("new_block_type:", new_block_type);
        // Continue with the logic using the new_block_type value

        const isPauseArea = pos_array_diffs[pos_arr_last][1]>3;

        if (isPauseArea)
        {
            //here we have a new area - the only thing is
            //pos_arr_last wont be indexed anywhere
            //and new block needs to be introduced
            //for now just skip??
            console.log("SKIPPING PAUSE BLOCK:",pos_arr_last,pos_array_diffs[pos_arr_last][1])
          
        }
        else if (paceBlock.paceBlocks[block_id].block_type===new_block_type)
        {
          console.log("GOON SAME BLOCK:",new_block_type, paceBlock.paceBlocks[block_id].init, paceBlock.paceBlocks[block_id].last)
          paceBlock.paceBlocks[block_id].dist += pos_array_diffs[pos_arr_last][0];
          paceBlock.paceBlocks[block_id].time += pos_array_diffs[pos_arr_last][1];
          paceBlock.paceBlocks[block_id].last = pos_arr_last;
          const [pace, kmh] = calc_run_params(paceBlock.paceBlocks[block_id].dist, paceBlock.paceBlocks[block_id].time);
          paceBlock.paceBlocks[block_id].pace = pace;  
        }
        else
        {
          console.log("paceBlock.paceBlocks[",block_id,"]:", paceBlock.paceBlocks[block_id])     
          console.log("new_block_type:",new_block_type)
          paceBlock.paceBlocks.push({init:pos_arr_last-1, 
                                     last:pos_arr_last, 
                                     pace:stDict["50m"].last_pace, 
                                     dist:pos_array_diffs[pos_arr_last][0], 
                                     time:pos_array_diffs[pos_arr_last][1], 
                                     block_type:new_block_type});
          console.log("paceBlock.paceBlocks[",block_id,block_id+1,"]:", paceBlock.paceBlocks.slice(block_id-1,block_id+1))
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle any errors that occur during the promise execution
      });

    }, [current_location]);
    

    let content = null;
    if (display_page_mode === 'Debug Screen') {
      content = <DebugScreen insets={insets} stDict={stDict} screenText={screenText}/>;
    } else if (display_page_mode === 'SpeedScreens') {
      content = <SpeedScreen insets={insets} stDict={stDict} covered_dist={coveredDistance}/>;
    }else if (display_page_mode === 'MapScreen') {
      content = <MapScreen insets={insets}/>;
    }else if (display_page_mode === 'SimulateScreen') {
      content = <SimulateScreen insets={insets}/>;
    }else if (display_page_mode === 'PaceBlockScreen') {
      content = <PaceBlockScreen insets={insets}/>;
    }
    return (
      <>
        {content}
      </>
    );
}