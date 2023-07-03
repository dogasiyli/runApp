export type GeodesicResult = {
  s_geo_len: number,
  α1: number,
  α2: number,
  pace: number,
  kmh: number,
  time_diff: number,
}

export type GPS_Data = {
  "coords": 
  {
      "accuracy": number, 
      "altitude": number, 
      "altitudeAccuracy": number, 
      "heading": number, 
      "latitude": number, 
      "longitude": number, 
      "speed": number
  }, 
  "mocked"?: boolean, 
  "timestamp": number
}

export type CoveredDistance = {
  distance_all: number,
  distance_last: number,
  time_diff_last: number,
  dist_to_start: number
}

export type SpeedTimeCalced = {
  last_begin: number,
  last_end: number,
  last_dist: number,
  last_time: number,
  last_speed: number,
  last_pace: number,
  best_begin: number,
  best_end: number,
  best_dist: number,
  best_time: number,
  best_speed: number,
  best_pace: number,
}

// Define the type for the dictionary
export type SpeedTimeCalced_Dict = { [key: string]: SpeedTimeCalced };
  // Function to check if a key exists in the dictionary
export const stDict_hasKey = (_stDict:SpeedTimeCalced_Dict, _key: string) => {
    return _stDict.hasOwnProperty(_key);
  };
export const stDict_addEntry = async (_stDict:SpeedTimeCalced_Dict, _key: string, _val: SpeedTimeCalced, setStDict:any) => {
    const newEntry: SpeedTimeCalced = { ..._val };
    setStDict((prevDict: SpeedTimeCalced_Dict) => ({ ...prevDict, [_key]: newEntry }));
};

