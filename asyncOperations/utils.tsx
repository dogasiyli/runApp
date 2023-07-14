import { TimestampDiffInfoProps } from "../assets/interface_definitions";
import { GeodesicResult, CoveredDistance, GPS_Data, SimulationDict} from "../assets/types";

export const format_time_diff = (time_diff: number): TimestampDiffInfoProps => {
  const diffInSeconds = Math.floor(time_diff/1000);

  let formatted_time_diff = '';
  if (diffInSeconds < 2) {
    formatted_time_diff = `<2 sec`;
  }
  else if (diffInSeconds < 60) {
    formatted_time_diff = `${diffInSeconds} sec`;
  } else {
    formatted_time_diff = '>1 min';
  }

  return {
    Formatted_Time_Diff: formatted_time_diff,
    Diff_In_Seconds: diffInSeconds,
  };
};

export const format_degree_to_string = (direction_in_degrees: number): string => {
  const degrees: number = Math.floor(direction_in_degrees);
  const minutes_decimal: number = (direction_in_degrees - degrees) * 60;
  const minutes: number = Math.floor(minutes_decimal);
  const seconds: number = (minutes_decimal - minutes) * 60;
  // Use Unicode character for upperscript "o" (U+00B0) or upperscript zero (U+2070)
  const upperscript_o: string = '\u00B0'; // or '\u2070'
  return `${degrees}${upperscript_o}${minutes}'${seconds.toFixed(2)}''`;
}


export const handleTimerInterval = async (
    bool_record_locations:boolean,
    initTimestamp: number,
    lastTimestamp: number,
    simParams: SimulationDict,
    setActiveTime: React.Dispatch<React.SetStateAction<number>>,
    setPassiveTime: React.Dispatch<React.SetStateAction<number>>,
    setTotalTime: React.Dispatch<React.SetStateAction<number>>,
    setLastTimestamp: React.Dispatch<React.SetStateAction<number>>,
    setInitTimestamp: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const curTimestamp = Date.now();
  
    // Check if bool_record_locations changed to true and initTimestamp is null
    if (bool_record_locations && initTimestamp === null) {
      setInitTimestamp(curTimestamp);
      setLastTimestamp(curTimestamp);
    }
    if (simParams.index>0 && initTimestamp === null) {
      setInitTimestamp(simParams.gpsDataArray[0].timestamp);
      setLastTimestamp(simParams.gpsDataArray[0].timestamp);
    }
  
    // Check if bool_record_locations changed
    if (lastTimestamp !== null) {
      const duration = (simParams.index>0 ? simParams.gpsDataArray[simParams.index].timestamp : curTimestamp) - lastTimestamp;
      if (bool_record_locations)
      {
        if (bool_record_locations) {
          setActiveTime((prevActiveTime) => prevActiveTime + duration);
        } 
        setLastTimestamp(curTimestamp);
      }
      else if (simParams.index>0)
      {
        //console.log("-*0-*0-*0-*0-handleTimerInterval:",simParams.index,duration)
        if (duration<2000) {
          setActiveTime((prevActiveTime) => prevActiveTime + duration);
        } else {
          setPassiveTime((prevPassiveTime) => prevPassiveTime + duration);
        }
        setLastTimestamp(simParams.gpsDataArray[simParams.index].timestamp);
      }
      else {
        setPassiveTime((prevPassiveTime) => prevPassiveTime + duration);
        setLastTimestamp(curTimestamp);
      }
      setTotalTime((prevTotalTime) => prevTotalTime + duration);
    }
  };
  
const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

const deg_dms = (deg: number): string => {
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const s = ((deg - d - m / 60) * 3600).toFixed(2);
  return `${d}° ${m}' ${s}"`;
};

export const calc_pace_from_kmh = (kmh: number, verbose: boolean = false): number => {
  const pace = 60 / kmh;
  if (verbose) {
    const minutes = Math.floor(pace);
    const seconds = Math.floor((pace - minutes) * 60);
    console.log(`Pace: ${minutes} minutes ${seconds} seconds per kilometer`);
  }
  return pace;
};

export const calc_run_params = (dist_in_meters: number, time_in_seconds: number, verbose: boolean = false): [number, number] => {
  const mps = dist_in_meters / time_in_seconds;
  const kmh = mps * 3.6;
  if (verbose) {
    console.log(`Meters per second: ${mps}, Kilometers per hour: ${kmh}, Distance: ${dist_in_meters} meters, Time: ${time_in_seconds} seconds`);
  }
  const pace = calc_pace_from_kmh(kmh, verbose);
  return [pace, kmh];
};

export const calc_geodesic = async (p1: any, p2: any, verbose: boolean = false): Promise<GeodesicResult> => {  
    let time_diff: number, φ1: number, φ2: number, λ1: number, λ2: number;
    if (p1.coords && p2.coords) {
      const t1 = new Date(p1.timestamp);
      const t2 = new Date(p2.timestamp);
      time_diff = (t2.getTime() - t1.getTime()) / 1000;
      φ1 = toRadians(p1.coords.latitude);
      φ2 = toRadians(p2.coords.latitude);
      λ1 = toRadians(p1.coords.longitude);
      λ2 = toRadians(p2.coords.longitude);
    }
    else if (p1 && p2 && p1.lat !== undefined && p1.lon !== undefined && p2.lat !== undefined && p2.lon !== undefined) {
      time_diff =0;
      φ1 = toRadians(p1.lat);
      φ2 = toRadians(p2.lat);
      λ1 = toRadians(p1.lon);
      λ2 = toRadians(p2.lon);
    }
    else {
      console.log("p1 is not of type LocationObject", "p1:", p1);
      return null;
    }
  
    if (verbose) {
      console.log(`Time Difference: ${time_diff} seconds`);
    }
  
    const a = 6378137.0;
    const b = 6356752.314245;
    const f = (a - b) / a;
  
    const L = λ2 - λ1;
    const tanU1 = (1 - f) * Math.tan(φ1);
    const tanU2 = (1 - f) * Math.tan(φ2);
    const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
    const cosU2 = 1 / Math.sqrt(1 + tanU2 * tanU2);
    const sinU1 = tanU1 * cosU1;
    const sinU2 = tanU2 * cosU2;
  
    let λ = L;
    let sinλ: number | null = null;
    let cosλ: number | null = null;
    let σ: number | null = null;
    let sinσ: number | null = null;
    let cosσ: number | null = null;
    let cos2σₘ: number | null = null;
    let cosSqα: number | null = null;
    let λʹ: number | null = null;
  
    while (true) {
      sinλ = Math.sin(λ);
      cosλ = Math.cos(λ);
      const sinSqσ = Math.pow(cosU2 * sinλ, 2) + Math.pow(cosU1 * sinU2 - sinU1 * cosU2 * cosλ, 2);
  
      if (sinSqσ === 0) {
        break;
      }
  
      sinσ = Math.sqrt(sinSqσ);
      cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
      σ = Math.atan2(sinσ, cosσ);
      const sinα = (cosU1 * cosU2 * sinλ) / sinσ;
      cosSqα = 1 - sinα * sinα;
      cos2σₘ = cosσ - (2 * sinU1 * sinU2) / cosSqα;
      const C = (f / 16) * cosSqα * (4 + f * (4 - 3 * cosSqα));
      λʹ = λ;
      λ =
        L +
        (1 - C) *
          f *
          sinα *
          (σ + C * sinσ * (cos2σₘ + C * cosσ * (-1 + 2 * cos2σₘ * cos2σₘ)));
  
      if (Math.abs(λ - λʹ) <= 1e-12) {
        break;
      }
    }
  
    if (cosSqα === null) {
      return {
        s_geo_len: 0,
        α1: 0,
        α2: 0,
        pace: 0,
        kmh: 0,
        time_diff: 1,
      };
    }
  
    const uSq = (cosSqα * (a * a - b * b)) / (b * b);
    const A =
      1 +
      (uSq / 16384) *
        (4096 +
          uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B =
      (uSq / 1024) *
      (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    const Δσ =
      B *
      sinσ *
      (cos2σₘ +
        (B / 4) *
          (cosσ * (-1 + 2 * cos2σₘ * cos2σₘ) -
            (B / 6) *
              cos2σₘ *
              (-3 + 4 * sinσ * sinσ) *
              (-3 + 4 * cos2σₘ * cos2σₘ)));
  
    const s_geo_len = b * A * (σ - Δσ);
    const α1 = Math.atan2(cosU2 * sinλ, cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
    const α2 = Math.atan2(cosU1 * sinλ, -sinU1 * cosU2 + cosU1 * sinU2 * cosλ);
  
    const results = {
      s_geo_len: s_geo_len,
      α1: α1,
      α2: α2,
      pace: 0,
      kmh: 0,
      time_diff: time_diff,
    };
  
    const [pace, kmh] = calc_run_params(s_geo_len, time_diff);
  
    results.pace = pace;
    results.kmh = kmh;
  
    if (verbose) {
      console.log(`time_diff = ${time_diff} seconds`);
      console.log(`s_geo_len(length of the geodesic) = ${s_geo_len}`);
      console.log(`α1(initial bearing) = ${α1} radians`);
      console.log(`α2(final bearing) = ${α2} radians`);
      console.log(`s(length of the geodesic) = ${s_geo_len.toFixed(3)} meters`);
      console.log(`α1(initial bearing) = ${deg_dms(α1)}`);
      console.log(`α2(final bearing) = ${deg_dms(α2)}`);
    }
  
    return results;
}
  
export const get_last_dist = async (arr_location_history: any[], n: number, verbose: boolean):Promise<GeodesicResult> => {
  const N = arr_location_history.length;

  const lastIndex = Math.max(N - 1, 1);
  const startIndex = Math.max(1, N - n);

  if (lastIndex === startIndex) {
    return {
      s_geo_len: 0,
      α1: 0,
      α2: 0,
      pace: 0,
      kmh: 0,
      time_diff: 1,
    };
  }

  //console.log("lastIndex:", lastIndex, "startIndex:", startIndex);
  const p1 = arr_location_history[startIndex];
  const p2 = arr_location_history[lastIndex];

  return calc_geodesic(p1, p2, verbose);
};

export const get_dist_time = async (pos_array_diffs: any[], interval: number, calc_type: string, verbose: boolean) => {
  let sum_milisec = 0;
  let sum_meters = 0;
  let diff_msec = 0;
  //console.log("XXX 1 interval:", interval, "calc_type:", calc_type)
  if (!pos_array_diffs) {
    return {
      distance: 0,
      pace: 0,
      kmh: 0,
      time_diff: 0,
    };
  }
  //console.log("XXX 2 interval:", interval, "calc_type:", calc_type)
  let i=0;
  if (pos_array_diffs && pos_array_diffs.length > 1) {
    i = pos_array_diffs.length - 1;
  } else {
    return {
      distance: 0,
      pace:0,
      kmh:0,
      time_diff: 0,
    };
  }
  //console.log("XXX 3 interval:", interval, "calc_type:", calc_type, "lenght arr:", pos_array_diffs.length)
  while (i >= 0 && (calc_type==="seconds" ? sum_milisec <= interval : sum_meters <= interval)) {
    diff_msec = pos_array_diffs[i][1];
    if (diff_msec > 10) {
      i--;
      continue;
    }
    sum_meters += pos_array_diffs[i][0];
    sum_milisec += diff_msec;
    i--;
  }

  const [pace, kmh] = calc_run_params(sum_meters, sum_milisec);
  //console.log("YYY sum_meters:", sum_meters, "sum_milisec:", sum_milisec, "i:", i+1);
  //console.log("ZZZ pace:", pace, "kmh:", kmh);

  return {
    distance: sum_meters,
    pace,
    kmh,
    time_diff: sum_milisec,
  };
};

export const get_dist_covered = async (arr_location_history: any[], pos_array_diffs: any[], ignore_duration: number, verbose: boolean):Promise<CoveredDistance> => {
  let sum_meters_all = 0.1;
  let sum_meters_last = 0.1;
  let sum_seconds_last = 0.1;
  let diff_msec = 0.0;
  let bool_stop_last_add = false;

  if (!pos_array_diffs) {
    //console.log("no dist covered yet 1")
    return {
      distance_all: 0,
      distance_last: 0,
      time_diff_last: 0,
      dist_to_start: 0
    };
  }

  let i = 0;
  if (pos_array_diffs && pos_array_diffs.length > 1) {
    i = pos_array_diffs.length - 1;
  } 
  else {
    //console.log("no dist covered yet 2")
    return {
      distance_all: 0,
      distance_last: 0,
      time_diff_last: 0,
      dist_to_start: 0
    };
  }

  //console.log("start:", i);
  // at first ignore_duration stop adding to sum_meters_last
  while (i >= 0) {
    diff_msec = pos_array_diffs[i][1];
    bool_stop_last_add = bool_stop_last_add || (diff_msec >= ignore_duration);

    sum_seconds_last += bool_stop_last_add ? 0 : diff_msec;
    sum_meters_last += bool_stop_last_add ? 0 : pos_array_diffs[i][0];
    sum_meters_all += (diff_msec <= ignore_duration) ? pos_array_diffs[i][0] : 0;
    //console.log(i, ". sum_seconds_last:", sum_seconds_last, "sum_meters_last:", sum_meters_last, "sum_meters_all:", sum_meters_all);

    //if  (diff_msec >= ignore_duration) {
      //console.log("ignore at:", i, ", diff_msec:", diff_msec, ", ignore_duration:", ignore_duration)
    //}
    //else{
      //console.log("go on at:", i, ", diff_msec:", diff_msec, ", ignore_duration:", ignore_duration)
    //}
    i--;
  }
  //console.log("exited at:", i)

  const dist_to_start = await get_last_dist(arr_location_history, arr_location_history.length, false);
  //console.log("dist_to_start:", dist_to_start)

  return {
    distance_all: sum_meters_all,
    distance_last: sum_meters_last,
    time_diff_last: sum_seconds_last,
    dist_to_start: dist_to_start.s_geo_len
  };
};


export const update_pos_array = async (arr_location_history: any[], pos_array_kalman:object[], 
                                       pos_array_diffs:object[], pos_array_timestamps:any,
                                       set_pos_array_timestamps:any): Promise<any> => {
  if (!arr_location_history)
  {
    //console.log("44444444444444444444444444444444444");
    //console.log("update_pos_array arr_location_history is null");
    return;
  }
  //initialize posDict with the first position in arr_location_history
  try {
      //console.log("55555555555555555555555555555555555");
      //console.log("update_pos_array len=", arr_location_history.length);

      if (arr_location_history.length > 1) {
        const initial_ts: number = arr_location_history[0]['timestamp'];
        const final_ts: number = arr_location_history[arr_location_history.length - 1]['timestamp'];
        {
          // Find the minimum timestamp in arr_location_history that is less than posDict.ts.final
          // start by looking at the last item in arr_location_history
          // when it is less than posDict.ts.final, break and use that timestamp as the minimum
          let minTimestamp = pos_array_timestamps?.final;
          let i = arr_location_history.length - 1;
          //console.log("pos_array_timestamps.final(", pos_array_timestamps?.final ,")");
          for (; i >= 0; i--) {
            const timestamp = arr_location_history[i]['timestamp'];
            //console.log(i, "(", timestamp ,"),");
            if (timestamp <= pos_array_timestamps?.final) {
              minTimestamp = timestamp;
              //console.log("break at timestamp @i=",i, ", pos_dict.ts.final(", pos_array_timestamps?.final,"), minTimestamp(", minTimestamp,")");
              break;
            }
          }
          // now minTimestamp is the maximum timestamp in arr_location_history that is less than or equal to posDict.ts.final
          // and i is the index of that timestamp in arr_location_history
          // Add all arr_location_history item diffs accordingly
          //console.log("will try to push dif after i(",i,") to ", arr_location_history.length - 1);
          let prevLocation = arr_location_history[i];
          //console.log("prevLocation:", prevLocation);

          for (; i < arr_location_history.length - 1; i++) {
            //console.log("push dif between i(",i,", ",i+1,")");
            const location = arr_location_history[i + 1];
            const diff_milisecs = location['timestamp'] - prevLocation['timestamp'];
            //console.log("----pos_array_kalman.push----");
            pos_array_kalman.push([location.coords.latitude, location.coords.longitude, location.coords.altitude, location.coords.accuracy, location.coords.altitudeAccuracy, diff_milisecs]);
            //console.log("----calc_geodesic----");
            const dif_last_two = await calc_geodesic(prevLocation, location, false);
            //console.log("i",i,"--dif_last_two:", dif_last_two);
            pos_array_diffs.push([dif_last_two.s_geo_len, dif_last_two.time_diff,i]);
            //console.log("----diffs.push----");
            prevLocation = location;
          }
          set_pos_array_timestamps((prevState) => ({
            ...prevState,
            final: arr_location_history[arr_location_history.length - 1]['timestamp'], // Set the new value for pos_array_timestamps.final
          }));
          //console.log("updated ", pos_array_timestamps?.final," to ", arr_location_history[arr_location_history.length - 1]['timestamp']);
        }
      }
  }
  catch (err) {
    console.log("update_pos_array err:", err);;
  }
  return;
};
