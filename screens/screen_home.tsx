import { DimensionValue, View } from 'react-native';
import Dialog from "react-native-dialog";
import * as TaskManager from 'expo-task-manager';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BT_Circle_Clickable, BT_Image_Clickable } from '../functions/display/buttons';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { getPermits } from '../asyncOperations/requests';
import { useAppState } from '../assets/stateContext';
import { CALC_DISTANCES_FIXED, CALC_TIMES_FIXED, FIXED_DISTANCES, INIT_TIMES } from '../assets/constants';
import { handleTimerInterval, update_pos_array } from '../asyncOperations/utils';
import { updateCalcedResults, updateDistances, updateLocationHistory, updatePosDict } from '../asyncOperations/asyncCalculations';
import { animate_point, define_tracking_job, updateMapInformation, updatePolyGroups, loadAutoSavedLocations } from '../asyncOperations/gpsOperations';
import { loadSimulationData, startStopSimulation } from '../asyncOperations/simulationOperations';
import { useLocationTracking } from '../functions/gps';
import * as Storage from '../functions/gps/storage';
import { getFormattedDateTime, getReadableDuration } from '../asyncOperations/fileOperations';

export function Screen_Home({navigation}) {
  const insets = useSafeAreaInsets();
  const tracking = useLocationTracking();
  const { set_permits, 
          bool_record_locations, enable_record_locations,
          bool_update_locations, enable_update_locations,
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
          runState, runStateRef

  } = useAppState();
  const prevBoolRecordLocations = useRef(bool_record_locations);
  const prevBoolUpdateLocations = useRef(bool_update_locations);
  const [askForRecoverRun, setAskForRecoverRun] = useState(true);

  const handleDeleteRecoveredRun = () => {
    const deleteRecoveredRun = async () => {
      await Storage.clearLocations();
    }
    deleteRecoveredRun();
    setAskForRecoverRun(false);
  };
  const handleRecoverRun = () => {
    const af1 = async () => {
      set_pos_array_timestamps({
        initial: arr_location_history[0]['timestamp'],
        final: arr_location_history[1]['timestamp'],
      });
    }
    const af2 = async () => {
      for (let i=0; i < arr_location_history.length - 1; i++) {
        updateMapInformation(mapData, setMapData, true, simulationParams, arr_location_history[i]);
      }
    }
    const recoverRecoveredRun = async () => {
      await loadAutoSavedLocations(arr_location_history);
      //now make the calculations and set map etc.
      //await af1();
      //console.log("pos_array_timestamps:",pos_array_timestamps)
      //await update_pos_array(arr_location_history, pos_array_kalman, pos_array_diffs, pos_array_timestamps, set_pos_array_timestamps);
      // await updateDistances(arr_location_history, (bool_record_locations || !simulationParams.isPaused), pos_array_diffs, current_location, setCoveredDistance);
      // await updateCalcedResults(pos_array_diffs, stDict, setStDict, "time", CALC_TIMES_FIXED[0]);
      // await updateCalcedResults(pos_array_diffs, stDict, setStDict, "time", CALC_TIMES_FIXED[1]);
      // await updateCalcedResults(pos_array_diffs, stDict, setStDict, "time", CALC_TIMES_FIXED[2]);
      // await updateCalcedResults(pos_array_diffs, stDict, setStDict, "distance", CALC_DISTANCES_FIXED[0]);
      // await updateCalcedResults(pos_array_diffs, stDict, setStDict, "distance", CALC_DISTANCES_FIXED[1]);
      // await updateCalcedResults(pos_array_diffs, stDict, setStDict, "distance", CALC_DISTANCES_FIXED[2]);
      // await af2();
      // set_current_location(arr_location_history[arr_location_history.length - 1]);
    }
    recoverRecoveredRun();
    setAskForRecoverRun(false);
  };

  useEffect(() => {
    const checkIfAnyRecoveredRun = async () => {
      const hist_from_storage = await Storage.getLocations()
      setAskForRecoverRun(hist_from_storage.length > 0 && runState==="initial")
    }
    checkIfAnyRecoveredRun();
  }, []);

  // useEffect for getting permissions
  useEffect (() => {
    const _getPermits = async () => {
      const _permits = await getPermits('locationForeGround,mediaLibrary');
      set_permits(_permits);
    }
    _getPermits()
    .catch(console.error);
  }, []);

  useEffect(() => {
    const checkifregistered = async () => {
      const registeredTasks = await TaskManager.getRegisteredTasksAsync();
      console.log('[useEffect001]-', 'Currently registered tasks', registeredTasks);
    }

    define_tracking_job(set_current_location, runStateRef);
    checkifregistered();
    
  }, []);

  // useEffect for starting and ending tracking location
  useEffect(() => {
    // Check if bool_record_locations has changed
    let start = false;
    let stop = false;
    if (bool_record_locations !== prevBoolRecordLocations.current) {
      // Update previous values
      prevBoolRecordLocations.current = bool_record_locations;
      console.log("(CHNG)bool_record_locations:",bool_record_locations, "bool_update_locations:",bool_update_locations)
      bool_record_locations ? "" : bool_update_locations ? start=true : stop=true;
    }
    // Check if  bool_update_locations has changed
    if (bool_update_locations !== prevBoolUpdateLocations.current) {
      // Update previous values
      console.log("(CHNG)bool_update_locations:",bool_update_locations, "bool_record_locations:",bool_record_locations)
      prevBoolUpdateLocations.current = bool_update_locations;
      bool_update_locations ? start=true : stop=true;
    }

    if (start)
    {
      console.log("start tracking")
      tracking.startTracking();
    }
    if (stop)
    {
      console.log("stop tracking")
      tracking.stopTracking();
    }
  }, [bool_record_locations, bool_update_locations]);


  // useEffect runState effecting enable_record_locations and enable_update_locations
  useEffect(() => {
    console.log("runState:",runState)
    runStateRef.current = runState;
    if (runState==="paused" || runState==="finish")
    { 
      enable_record_locations(false);
    }
    if (runState=="finish")
    {
      enable_update_locations(false);
    }
    if (runState==="running")
    { 
      enable_update_locations(true);
      enable_record_locations(true);
    }
  }, [runState]);

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
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };
    //console.log("current_location changed to:", formatTimestamp(current_location.timestamp))
    const fetchData = async () => {
      const first_if = (bool_record_locations || !simulationParams.isPaused) && (current_location.coords.accuracy < FIXED_DISTANCES["ALLOWED_COORD_ACCURACY"]);
      //console.log("fetchData:bool_record_locations(",bool_record_locations,"), simulationParams.isPaused(",simulationParams.isPaused,")");
      //console.log("current_location.coords.accuracy(",current_location.coords.accuracy,")");
      //console.log("try fetchData ", isCalculating, bool_record_locations);
      if (first_if) {
        await updateLocationHistory(arr_location_history, bool_record_locations, simulationParams.isPaused, current_location);
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
      let stSummary = '';
      for (const key in stDict) {
        const lastPace = stDict[key].last_pace;
        const paceStr = getReadableDuration(lastPace*60000);
        const distance = key;
        stSummary += `${distance}|${paceStr} /// `;
      }
      if (pos_array_diffs.length > 0)
      {
        const last_diff = pos_array_diffs.length > 0 ? pos_array_diffs[pos_array_diffs.length-1] : null;
        const last_diff_long = last_diff[1]>2;
        console.log("*******************************************************")
        console.log("pos_array_diffs.length:",pos_array_diffs.length)
        last_diff_long ? console.log("++++++++++++++++++last_diff:", last_diff) : null;
        console.log("TrainDuration:", getReadableDuration(current_location.timestamp-arr_location_history[0]["timestamp"]))
        console.log("stDict summary:", stSummary);
        if (last_diff_long)
        { setSimulationParams((prevParams) => ({
               ...prevParams,
               isPaused: true,
          }));
  
        } 
      }
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
  
    const tops:DimensionValue[] = ["10%", "40%", "70%", "100%"];
  return (
    <>
    
    {askForRecoverRun ? (
      <View style={{flex: 1, backgroundColor: "#fff",alignItems: "center",justifyContent: "center",}}>
        <Dialog.Container visible={askForRecoverRun}>
          <Dialog.Title>Recover last run?</Dialog.Title>
          <Dialog.Description>
            Last time you exited without saving your run. Want to recover it?
          </Dialog.Description>
          <Dialog.Button label="No" onPress={handleDeleteRecoveredRun} />
          <Dialog.Button label="Yes" onPress={handleRecoverRun} />
        </Dialog.Container>
      </View>  

    ):(
      <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "#555" }}>
        <BT_Image_Clickable renderBool={true} top={tops[0]} left="10%" 
                            size_perc={0.20} nav={navigation} page_name="Speeds" 
                            page_navigate_str="GPS_Debug" display_page_mode="SpeedScreens" 
                            image_name='Speeds' imageTintColor='red' textColor='#fff'/>
        <BT_Image_Clickable renderBool={true} top={tops[0]} left="40%" 
                            size_perc={0.20} nav={navigation} page_name="Maps" 
                            page_navigate_str="GPS_Debug" display_page_mode="MapScreen" 
                            image_name='Maps' imageTintColor={undefined} textColor='#fff'/>
        <BT_Image_Clickable renderBool={true} top={tops[0]} left="70%" 
                            size_perc={0.20} nav={navigation} page_name="Simulate" 
                            page_navigate_str="GPS_Debug" display_page_mode="SimulateScreen"  
                            image_name='Simulate' imageTintColor={undefined} textColor='#fff'/>
        <BT_Image_Clickable renderBool={true} top={tops[1]} left="10%" 
                            size_perc={0.20} nav={navigation} page_name="Interval" 
                            page_navigate_str="GPS_Debug" display_page_mode="PaceBlockScreen"
                            image_name='Interval' imageTintColor={undefined} textColor='#fff' />
        <BT_Image_Clickable renderBool={true} top={tops[1]} left="40%" 
                            size_perc={0.20} nav={navigation} page_name="Motivators" 
                            page_navigate_str="Motivators" display_page_mode="Our Indomitable Run-Gurus"
                            image_name='Motivators' imageTintColor={undefined} textColor='#fff'/>   
        <BT_Circle_Clickable renderBool={true} top={tops[2]} left="10%" size_perc={0.25} nav={navigation} page_name="GPS Debug" page_navigate_str="GPS_Debug" display_page_mode="Debug Screen" />
        <BT_Circle_Clickable renderBool={false} top={tops[2]} left="40%" size_perc={0.25} nav={navigation} page_name="Moving Pts" page_navigate_str="Moveable_Points" />
        <BT_Circle_Clickable renderBool={false} top={tops[2]} left="70%" size_perc={0.25} nav={navigation} page_name="Screen Stack" page_navigate_str="Screen_Navigation" /> 

        <BT_Circle_Clickable renderBool={true} top={tops[3]} left="10%" size_perc={0.25} nav={navigation} page_name="Loginv2" page_navigate_str="Login" display_page_mode="Login Screen" />

      </View>
    )}
    </>
  );
}