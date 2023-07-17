import { update_pos_array, get_dist_covered } from '../asyncOperations/utils';
import { SpeedTimeCalced, SpeedTimeCalced_Dict, stDict_hasKey, stDict_addEntry } from '../assets/types';
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
export const updateLocationHistory = async (arr_location_history:object[], bool_record_locations:boolean, current_location:any) => {
    //console.log("+++++++++++++++++++++++++1");
    // const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
    // if (current_location["timestamp"] !== lastTimestamp && bool_record_locations) {
    //   arr_location_history.push(current_location);
    //   //console.log("POS COUNT :",arr_location_history.length);
    // }
    //console.log("ooooooooooooooooooooooooo1");
    const hist_from_storage = await Storage.getLocations()
    console.log("ooooooooooooooooooooooooo1-updateLocationHistory");
    for (let i = arr_location_history.length; i < hist_from_storage.length; i++) {
      arr_location_history.push(hist_from_storage[i]);
    }
    console.log("arr_location_history.le is now::",arr_location_history.length);
    return;
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
      console.log("BLOCK-1:::::::::::::::::::::");
      await initialize_post_dict(arr_location_history, set_pos_array_timestamps);
    }
    if (arr_location_history && arr_location_history.length > 2) {
      console.log("BLOCK-2:::::::::::::::::::::");
      await update_pos_array(arr_location_history, pos_array_kalman, pos_array_diffs, pos_array_timestamps, set_pos_array_timestamps);
      console.log("updated pos_array_timestamps:",pos_array_timestamps);
      console.log("updated pos_array_kalman and diff len:",pos_array_kalman.length,",",pos_array_diffs.length);
    }
    console.log("ooooooooooooooooooooooooo2");
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
      //console.log("BRAVO:", interval, interval_type, "updated best of stDict (", kmh, ">bestSpeed))");
    }
  }
  return stDictEntry;
}
export const updateCalcedResults = async (pos_array_diffs:object[], stDict:SpeedTimeCalced_Dict, 
                                          setStDict:React.Dispatch<React.SetStateAction<SpeedTimeCalced_Dict>>,
                                          interval_type: 'distance'|'time',
                                          interval:number,) => {
  const _key = `${interval}` + (interval_type === "distance" ? "m" : "s");
  //console.log("key is ", _key, " in stDict");
  if (!stDict_hasKey(stDict, _key)) {
     //console.log("will initialize ", _key, " in stDict");
     await stDict_addEntry(stDict,_key,SPEED_TIME_CALCED_INIT,setStDict);
     //console.log("initialized ", _key, " in stDict");
  }

  const skip_add_del_sec_lim = 4;
  const plenX = Infinity; //69
  const plenY = 0; //81

  const n = pos_array_diffs.length;
  let stDictEntry = stDict[_key];
  if (stDictEntry != undefined) {
    //console.log("111stDictEntry of key ", _key, " is ", stDictEntry);
    //console.log("n is ", n, "stDictEntry.last_dist:", stDictEntry.last_dist, "stDictEntry.last_time:", stDictEntry.last_time, "stDictEntry.last_end:", stDictEntry.last_end);
    if (_key==="10s" && pos_array_diffs.length<plenY && stDictEntry.last_speed>0)
    {
      console.log("111pos_array_diffs ", pos_array_diffs.length);
      console.log("111stDictEntry of key ", _key, " is ", stDictEntry);
      console.log("used pos_array_diffs:\n", pos_array_diffs.slice(stDictEntry.last_begin,stDictEntry.last_end))
    }
    while (stDictEntry.last_end < n-1 && ((interval_type === "distance" ? stDictEntry.last_dist : stDictEntry.last_time) < interval)) {
      if (skip_add_del_sec_lim>pos_array_diffs[stDictEntry.last_end][1])
      {
        stDictEntry.last_dist += pos_array_diffs[stDictEntry.last_end][0];
        stDictEntry.last_time += pos_array_diffs[stDictEntry.last_end][1];
      }
      //else
      //  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%SKIPPING POS ARR ENTRY1 : ", stDictEntry.last_end)
      stDictEntry.last_end++;
      if (_key==="10s" && pos_array_diffs.length<plenY && pos_array_diffs.length>plenX)
        console.log("222stDictEntry of key ", _key, " is ", stDictEntry);
    }
    stDictEntry = await update_best(stDictEntry, interval_type, interval);
    if (_key==="10s" && pos_array_diffs.length<plenY && pos_array_diffs.length>plenX)
      console.log("333stDictEntry of key ", _key, " is ", stDictEntry);
    while (stDictEntry.best_time > 0 && stDictEntry.last_end < n-1) {
      // if interval is less than what is accumulated
      // then we need to add the next point to the interval
      // else we need to remove the first point from the interval

      //ADD THE NEXT POINT
      if ((interval_type === "distance" ? stDictEntry.last_dist : stDictEntry.last_time) < interval) {
        stDictEntry.last_end++;
        if (skip_add_del_sec_lim>pos_array_diffs[stDictEntry.last_end][1])
        {
          stDictEntry.last_dist += pos_array_diffs[stDictEntry.last_end][0];
          stDictEntry.last_time += pos_array_diffs[stDictEntry.last_end][1];    
        }
        //else
        //  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%SKIPPING POS ARR ENTRY2 : ", stDictEntry.last_end)
        if (_key==="10s" && pos_array_diffs.length<plenY && pos_array_diffs.length>plenX)
          console.log("444stDictEntry of key ", _key, " is ", stDictEntry);
      }
      //REMOVE THE FIRST POINT
      else {
        stDictEntry.last_begin++;
        if (skip_add_del_sec_lim>pos_array_diffs[stDictEntry.last_begin-1][1])
        {
          stDictEntry.last_dist -= pos_array_diffs[stDictEntry.last_begin-1][0];
          stDictEntry.last_time -= pos_array_diffs[stDictEntry.last_begin-1][1];  
        }
        //else
        //  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%SKIPPING POS ARR ENTRY3 : ", stDictEntry.last_begin-1)
        if (_key==="10s" && pos_array_diffs.length<plenY && pos_array_diffs.length>plenX)
          console.log("555stDictEntry of key ", _key, " is ", stDictEntry);
      }
      stDictEntry  = await update_best(stDictEntry, interval_type, interval);
    }
    await stDict_addEntry(stDict,_key,stDictEntry,setStDict);
  }
};