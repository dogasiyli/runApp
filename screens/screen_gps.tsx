import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';

import { DebugScreen } from './screen_gps_dbg';
import { SpeedScreen } from './screen_gps_speeds';
import { MapScreen } from './screen_gps_maps'
import { SimulateScreen } from './screen_gps_simulate';
import { PaceBlockScreen } from './screen_gps_paceblocks';

import { useAppState } from '../assets/stateContext';

import { calc_run_params } from '../asyncOperations/utils';

import { stDict_hasKey } from '../assets/types';
import { resetSimulation } from '../asyncOperations/resetOperations';

export function Screen_GPS_Debug({route}) {
  const insets = useSafeAreaInsets();
  
  const { current_location,
          bool_record_locations,          
          pos_array_diffs,
          bool_update_locations, 
          paceBlock,
          stDict,
        } = useAppState();

  const [screenText, setscreenText] = useState("No locations yet");
  const prevBoolRecordLocations = useRef(bool_record_locations);
  const prevBoolUpdateLocations = useRef(bool_update_locations);      
  // Debug Screen, SpeedScreens
  const display_page_mode = route.params?.display_page_mode || '';  


  // UNNECESSARY USE EFFECT
  // Use effect for handling gps update informations
  useEffect(() => {
    // Check if bool_record_locations has changed
    if (bool_record_locations !== prevBoolRecordLocations.current) {
      // Update previous values
      prevBoolRecordLocations.current = bool_record_locations;
      let s = bool_record_locations ? "Recording locations" : "Not recording locations";
      s += bool_record_locations ? "" : bool_update_locations ? " but updating locations" : " nor updating locations";
      setscreenText(s)
    }
    // Check if  bool_update_locations has changed
    if (bool_update_locations !== prevBoolUpdateLocations.current) {
      // Update previous values
      prevBoolUpdateLocations.current = bool_update_locations;
      setscreenText(bool_update_locations ? "Updating locations" : "Not updating locations")
    }
  }, [bool_record_locations, bool_update_locations]);


    //PACE BLOCKS
    useEffect(() => {
      const initialize_pace_blocks_array = async () => {
        //console.log("paceBlock.initial_index===0 && paceBlock.paceBlocks.length===0")
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
        //console.log("paceBlock.initial_index===-1")
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
      content = <DebugScreen insets={insets} screenText={screenText}/>;
    } else if (display_page_mode === 'SpeedScreens') {
      content = <SpeedScreen insets={insets}/>;
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