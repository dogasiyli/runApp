import { update_pos_array, get_dist_covered } from '../asyncOperations/utils';

export const updateDistances = async (arr_location_history:object[], bool_record_locations:boolean, 
                                      pos_array_diffs:object[], current_location:any, 
                                      setCoveredDistance:any) => {
    console.log("+++++++++++++++++++++++++3");
    const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
    console.log(current_location["timestamp"], lastTimestamp);
    if (bool_record_locations) {
      console.log("bool_record_locations:",bool_record_locations);
      if (bool_record_locations) {
        console.log("CALCULATING DISTANCE");
        const dist_covered = await get_dist_covered(arr_location_history, pos_array_diffs, 8, false);
        console.log("DISTANCE CALCULATED");
        setCoveredDistance(dist_covered);
        console.log("DISTANCE SET");
      }
    }
    console.log("ooooooooooooooooooooooooo3");
    return;
};
export const updateLocationHistory = async (arr_location_history:object[], bool_record_locations:boolean, current_location:any) => {
    //console.log("+++++++++++++++++++++++++1");
    const lastTimestamp = arr_location_history.length > 0 ? arr_location_history[arr_location_history.length - 1]["timestamp"] : null;
    if (current_location["timestamp"] !== lastTimestamp && bool_record_locations) {
      arr_location_history.push(current_location);
      //console.log("POS COUNT :",arr_location_history.length);
    }
    //console.log("ooooooooooooooooooooooooo1");
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
}