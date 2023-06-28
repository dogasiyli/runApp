import { update_pos_array, initialize_post_dict , get_dist_covered } from '../asyncOperations/utils';

let isCalculating = false;
export const updateLocationHistory = async (arr_location_history:object[], bool_record_locations:boolean, position_dict:any, current_location:any, 
                                            setCoveredDistance:any) => {
    let pos_dict = position_dict;
    if (isCalculating)
    {
        console.log("-------------------------");
        console.log("SKIPPING CALCULATING");
        console.log("-------------------------");
        return pos_dict;
    }

    console.log("+++++++++++++++++++++++++2");
    isCalculating = true;
    const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
    if (current_location["timestamp"] !== lastTimestamp && bool_record_locations) {
      
      arr_location_history.push(current_location);
      console.log("POS COUNT :",arr_location_history.length, position_dict);

      if (arr_location_history && arr_location_history.length === 2) {
        console.log("BLOCK-1:::::::::::::::::::::");
        pos_dict = await initialize_post_dict(arr_location_history);
      }
      if (arr_location_history && arr_location_history.length > 2) {
        console.log("BLOCK-2:::::::::::::::::::::");
        const [locs, diffs, ts] = await update_pos_array(arr_location_history, pos_dict);
        if (ts!=null && locs.length>0 && diffs.length>0)
        {
          console.log("updating position_dict:",ts);
          pos_dict.ts.final = ts;
          pos_dict.loc.push(...locs);
          pos_dict.diff_arr.push(...diffs);
          console.log("updated position_dict:",locs.length,",",diffs.length);
        }
      }

      console.log("bool_record_locations:",bool_record_locations);
      if (bool_record_locations) {
        console.log("CALCULATING DISTANCE");
        const dist_covered = await get_dist_covered(arr_location_history, position_dict, 8, false);
        console.log("DISTANCE CALCULATED");
        setCoveredDistance(dist_covered);
        console.log("DISTANCE SET");
      }
    }
    isCalculating = false;
    console.log("ooooooooooooooooooooooooo2");
    return pos_dict;
};