import { update_pos_array, get_dist_covered } from '../asyncOperations/utils';
import { SpeedTimeCalced, SpeedTimeCalced_Dict, stDict_hasKey, stDict_addEntry, GPS_Data } from '../assets/types';
import { SPEED_TIME_CALCED_INIT } from '../assets/constants';
import { calc_run_params } from '../asyncOperations/utils';

import * as Storage from '../functions/gps/storage';

export const updateDistances = async (arr_location_history:object[], bool_record_locations:boolean, 
                                      pos_array_diffs:object[], current_location:any, 
                                      setCoveredDistance:any) => {
    //console.log("+++++++++++++++++++++++++3");
    const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
    //console.log(current_location["timestamp"], lastTimestamp);
    if (bool_record_locations) {
      //console.log("bool_record_locations:",bool_record_locations);
      if (bool_record_locations) {
        //console.log("CALCULATING DISTANCE");
        const dist_covered = await get_dist_covered(arr_location_history, pos_array_diffs, 8, false);
        //console.log("DISTANCE CALCULATED");
        setCoveredDistance(dist_covered);
        //console.log("DISTANCE SET");
      }
    }
    //console.log("ooooooooooooooooooooooooo3");
    return;
};
export const updateLocationHistory = async (arr_location_history:GPS_Data[], bool_record_locations:boolean, simulationParamsisPaused:boolean, current_location:any) => {
  //console.log("updateLocationHistory:bool_record_locations:",bool_record_locations);
  //console.log("updateLocationHistory:simulationParamsisPaused:",simulationParamsisPaused);

  const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
  const loc_changed = current_location["timestamp"] !== lastTimestamp;
  const append_to_history = loc_changed && ( !simulationParamsisPaused || (simulationParamsisPaused && bool_record_locations ));
  
  if (append_to_history)
  {
      arr_location_history.push(current_location);
      if (arr_location_history[0]["coords"].accuracy == 0) {
        console.log("updateLocationHistory:removing 0::",arr_location_history[0]);
        arr_location_history.shift();
      }
      //console.log("updateLocationHistory:add new::",arr_location_history.length);    
  }

  // auto-save every 50 locations if not in simulation mode
  if (simulationParamsisPaused && arr_location_history.length>0 && arr_location_history.length%50 === 0) {
    await Storage.setLocations(arr_location_history);
    console.log('[storage]', 'auto-saved location -', arr_location_history.length, 'stored locations');
  }
  
};
const initialize_post_dict = async (arr_location_history: any[], set_pos_array_timestamps:React.Dispatch<React.SetStateAction<object>>): Promise<any> => {
  if (!arr_location_history || arr_location_history.length === 0) {
    return null;
  }

  const initial_ts: number = arr_location_history[0]['timestamp'];
  const final_ts: number = arr_location_history[arr_location_history.length - 1]['timestamp'];

  set_pos_array_timestamps({
    initial: initial_ts,
    final: final_ts,
  });

  return;
};
export const updatePosDict = async (arr_location_history:object[], pos_array_kalman:object[], 
                                    pos_array_diffs:object[], pos_array_timestamps:object,
                                    set_pos_array_timestamps:React.Dispatch<React.SetStateAction<object>>,
                                    current_location:any) => {
    //console.log("+++++++++++++++++++++++++2");
    if (arr_location_history && arr_location_history.length === 2) {
      //console.log("BLOCK-1:::::::::::::::::::::");
      await initialize_post_dict(arr_location_history, set_pos_array_timestamps);
    }
    if (arr_location_history && arr_location_history.length > 2) {
      //console.log("BLOCK-2:::::::::::::::::::::");
      await update_pos_array(arr_location_history, pos_array_kalman, pos_array_diffs, pos_array_timestamps, set_pos_array_timestamps);
      //console.log("updated pos_array_timestamps:",pos_array_timestamps);
      //console.log("updated pos_array_kalman and diff len:",pos_array_kalman.length,",",pos_array_diffs.length);
    }
    //console.log("ooooooooooooooooooooooooo2");
};

const update_best = async (stDictEntry:SpeedTimeCalced, interval_type: 'distance'|'time', interval:number):Promise<SpeedTimeCalced> => {

  if (interval_type === 'distance' ? stDictEntry.last_dist >= interval : stDictEntry.last_time >= interval) {
    const [pace, kmh] = calc_run_params(stDictEntry.last_dist, stDictEntry.last_time);
    stDictEntry.last_speed = kmh;
    stDictEntry.last_pace = pace;
    if (kmh > stDictEntry.best_speed) {
      stDictEntry.best_begin = stDictEntry.last_begin;
      stDictEntry.best_end = stDictEntry.last_end;
      stDictEntry.best_dist = stDictEntry.last_dist;
      stDictEntry.best_time = stDictEntry.last_time;
      stDictEntry.best_speed = kmh;
      stDictEntry.best_pace = pace;
      if (interval_type !== 'distance' && interval == 10)
        console.log("BRAVO:", interval, interval_type, "updated best of stDict (", kmh, ">bestSpeed))");
    }
  }
  return stDictEntry;
}
const add_next_point = async (stDictEntry:SpeedTimeCalced, pos_array_diffs:object[], 
                              skip_add_del_sec_lim:number,
                              verbose_id:number,
                              verbose:boolean=false):Promise<SpeedTimeCalced> => {
  //adds the last entry if:
  // 1. the "last entry to add" is ok according to skip_add_del_sec_lim
  const n = pos_array_diffs.length;
  if (stDictEntry.last_end >= n-1)
  {
    if (verbose)
      console.log("PSDL_",verbose_id,"0::stDictEntry.last_end:", stDictEntry.last_end, "n:", n);
      return stDictEntry;
  }
  if (skip_add_del_sec_lim>pos_array_diffs[stDictEntry.last_end][1])
  {
    stDictEntry.last_dist += pos_array_diffs[stDictEntry.last_end][0];
    stDictEntry.last_time += pos_array_diffs[stDictEntry.last_end][1];
    if (verbose)
      console.log("PSDL_",verbose_id,"1::ADDED", stDictEntry.last_end, "d:", stDictEntry.last_dist, ",t:", stDictEntry.last_time);
  }
  else if (verbose)
    console.log("PSDL_",verbose_id,"2::SKIP ADD: ", stDictEntry.last_end, ":::", pos_array_diffs[stDictEntry.last_end][1])
  stDictEntry.last_end++;

  return stDictEntry;
}
const remove_begin_points = async (stDictEntry:SpeedTimeCalced, pos_array_diffs:object[], 
                              skip_add_del_sec_lim:number,
                              interval_type: 'distance'|'time', interval:number,
                              verbose_id:number,
                              verbose:boolean=false):Promise<SpeedTimeCalced> => {
  //removes the beginning entry if:
  // 1. the "beginning entry to remove" is ok according to skip_add_del_sec_lim
  // 2. removing the beginning point does not make the interval too short
  const n = pos_array_diffs.length;
  let remove_next_first_point = true;
  while (remove_next_first_point)
  {
    if (verbose)
      console.log("PSDL_",verbose_id,"0::TRY REMOVE:", stDictEntry.last_begin)
    const cur_interval = (interval_type === "distance" ? stDictEntry.last_dist : stDictEntry.last_time);
    const time_diff = pos_array_diffs[stDictEntry.last_begin][1];
    const dist_to_remove = (skip_add_del_sec_lim>time_diff ? pos_array_diffs[stDictEntry.last_begin][0] : 0);
    const time_to_remove = (skip_add_del_sec_lim>time_diff ? pos_array_diffs[stDictEntry.last_begin][1] : 0);
    const x_to_remove = (interval_type === "distance" ? dist_to_remove : time_to_remove);
    const new_interval = cur_interval - (skip_add_del_sec_lim>time_diff ? x_to_remove : 0);
    if (new_interval>=interval)
    {
      stDictEntry.last_dist -= dist_to_remove;
      stDictEntry.last_time -= time_to_remove;  
      stDictEntry.last_begin++;
      if (verbose)
        console.log("PSDL_",verbose_id,"1::COULD REMOVE:", stDictEntry.last_begin-1, "d:", stDictEntry.last_dist, ",t:", stDictEntry.last_time)
    }
    else 
    {
      remove_next_first_point = false;
      if (verbose)
        console.log("PSDL_",verbose_id,"3::DO NOT REMOVE:", stDictEntry.last_begin, "-new_interval:", new_interval);
    }
  }
  return stDictEntry;
}
const print_verbose_PAD = (stDictEntry:SpeedTimeCalced, pos_array_diffs:object[]) => {
  console.log("PSDL_02::used pos_array_diffs:[", stDictEntry.last_begin, "-", stDictEntry.last_end,"]")
  let d=0,t=0;
  for (let i = stDictEntry.last_begin; i < stDictEntry.last_end; i++) {
    const dist = pos_array_diffs[i][0];
    const sec = pos_array_diffs[i][1];
    const idx = pos_array_diffs[i][2];
    const [pace, kmh] = calc_run_params(dist, sec);
    d+=dist;
    t+=sec;
    console.log(`${i}:${idx}: ${dist.toFixed(2)}, ${sec.toFixed(2)}, ${kmh.toFixed(2)} km/h`);
  }
  const [pace, kmh_sum] = calc_run_params(d, t);
  console.log(`sum: ${d.toFixed(2)}, ${t.toFixed(2)}, ${kmh_sum.toFixed(2)} km/h`);
}
export const updateCalcedResults = async (pos_array_diffs:object[], stDict:SpeedTimeCalced_Dict, 
                                          setStDict:React.Dispatch<React.SetStateAction<SpeedTimeCalced_Dict>>,
                                          interval_type: 'distance'|'time',
                                          interval:number,) => {
  const _key = `${interval}` + (interval_type === "distance" ? "m" : "s");
  if (!stDict_hasKey(stDict, _key)) {
     await stDict_addEntry(stDict,_key,SPEED_TIME_CALCED_INIT,setStDict);
  }

  const skip_add_del_sec_lim = 4;
  const plenX = 0; //Infinity; //
  const plenY = 80; //0; //

  const n = pos_array_diffs.length;
  let stDictEntry = stDict[_key];
  const print_some_debug_logs = _key==="10s" && pos_array_diffs.length<plenY && pos_array_diffs.length>plenX;
  if (print_some_debug_logs)
    console.log(":::::::LETS DEBUG :::::: 10s-idx:", pos_array_diffs.length);
  if (stDictEntry != undefined) {
    //console.log("111stDictEntry of key ", _key, " is ", stDictEntry);
    //console.log("n is ", n, "stDictEntry.last_dist:", stDictEntry.last_dist, "stDictEntry.last_time:", stDictEntry.last_time, "stDictEntry.last_end:", stDictEntry.last_end);
    if (print_some_debug_logs)
    {
      console.log("PSDL_01::stDictEntry of key ", _key, " is ", stDictEntry);
      print_verbose_PAD(stDictEntry, pos_array_diffs);
    }
    while (stDictEntry.last_end < n-1) {
      stDictEntry = await add_next_point(stDictEntry, pos_array_diffs, skip_add_del_sec_lim, 1, print_some_debug_logs);
      stDictEntry = await remove_begin_points(stDictEntry, pos_array_diffs, skip_add_del_sec_lim, interval_type, interval, 2, print_some_debug_logs);
      stDictEntry = await update_best(stDictEntry, interval_type, interval);
    }
    if (print_some_debug_logs)
      console.log("PSDL_30::stDictEntry of key ", _key, " is ", stDictEntry);
    await stDict_addEntry(stDict,_key,stDictEntry,setStDict);
    if (print_some_debug_logs)
      console.log(":::::::DEBUGGED :::::: 10s-idx:", pos_array_diffs.length);
  }
};