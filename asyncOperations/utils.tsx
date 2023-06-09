import { TimestampDiffInfoProps } from "../assets/interface_definitions";

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
  
    // Check if bool_record_locations changed
    if (lastTimestamp !== null) {
      const duration = curTimestamp - lastTimestamp;
      if (bool_record_locations) {
        setActiveTime((prevActiveTime) => prevActiveTime + duration);
      } else {
        setPassiveTime((prevPassiveTime) => prevPassiveTime + duration);
      }
      setTotalTime((prevTotalTime) => prevTotalTime + duration);
      setLastTimestamp(curTimestamp);
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

const calc_pace_from_kmh = (kmh: number, verbose: boolean = false): number => {
  const pace = 60 / kmh;
  if (verbose) {
    const minutes = Math.floor(pace);
    const seconds = Math.floor((pace - minutes) * 60);
    console.log(`Pace: ${minutes} minutes ${seconds} seconds per kilometer`);
  }
  return pace;
};

const calc_run_params = (dist_in_meters: number, time_in_seconds: number, verbose: boolean = false): [number, number] => {
  const mps = dist_in_meters / time_in_seconds;
  const kmh = mps * 3.6;
  if (verbose) {
    console.log(`Kilometers per hour: ${kmh}`);
  }
  const pace = calc_pace_from_kmh(kmh, verbose);
  return [pace, kmh];
};

export const calc_geodesic = async (p1: any, p2: any, verbose: boolean = false): Promise<any> => {  
    let time_diff: number, φ1: number, φ2: number, λ1: number, λ2: number;
    if (p1.coords && p2.coords) {
      const t1 = new Date(p1.timestamp);
      const t2 = new Date(p2.timestamp);
      time_diff = (t2.getTime() - t1.getTime()) / 1000;
      φ1 = toRadians(p1.coords.latitude);
      φ2 = toRadians(p2.coords.latitude);
      λ1 = toRadians(p1.coords.longitude);
      λ2 = toRadians(p2.coords.longitude);
    } else {
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
  
export const get_last_dist = (arr_location_history: any[], n: number, verbose: boolean) => {
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
    };
  }

  //console.log("lastIndex:", lastIndex, "startIndex:", startIndex);
  const p1 = arr_location_history[startIndex];
  const p2 = arr_location_history[lastIndex];

  return calc_geodesic(p1, p2, verbose);
};