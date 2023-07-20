import { GPS_Data, PaceBlockDict, SimulationDict, SpeedTimeCalced } from "./types";
import { IMapData } from "./interface_definitions";

export const CALC_DISTANCES_FIXED = [200, 100, 50];
export const CALC_TIMES_FIXED = [60, 30, 10];

export const FIXED_DISTANCES = {
    "MAP_DATA_ADD": 10,
    "POLY_GROUP_MAX_WITHIN_DISTANCE": 20,
    "ALLOWED_COORD_ACCURACY": 15,
};

export const INIT_SIMULATION_PARAMS: SimulationDict = {
    index: -1,
    timestampOffset: 0,
    interval: null,
    gpsDataArray: [],
    isPaused: true,
    selected: 'BFFast',
    stepSelected: 3000,
};
export const INIT_POSITION = {
    "coords": 
    {
        "accuracy": 0.0, 
        "altitude": 0.0, 
        "altitudeAccuracy": 0.0, 
        "heading": 0, 
        "latitude": 0.0, 
        "longitude": 0.0, 
        "speed": 0
    }, 
    "mocked": false, 
    "timestamp": 1684322924302
}
export const INIT_PERMITS = {
    "locationFore": false,
    "locationBack": false,
    "mediaLibrary": false,
}
export const INIT_TIMES = {
    "gpsUpdateMS": 1000,
    "timerUpdateMS": 1000,
}
export const TIME_STAMPS = {
    "initial": null,
    "final": null,
}

export const SPEED_TIME_CALCED_INIT:SpeedTimeCalced = {
    "last_begin": 0,
    "last_end": 0,
    "last_dist": 0,
    "last_time": 0,
    "last_speed": 0,
    "last_pace": 0,
    "best_begin": 0,
    "best_end": 0,
    "best_dist": 0,
    "best_time": 0,
    "best_speed": 0,
    "best_pace": 0,
}

export const latDelta_min = 0.005;
export const lonDelta_min = 0.0010;

export const INITIAL_MAP_DATA: IMapData = {
    locations: [],
    polyGroup: [],
    loc_boundaries: {
        lat_min: Infinity,
        lat_max: -Infinity,
        lon_min: Infinity,
        lon_max: -Infinity,
        lat_delta: latDelta_min,
        lon_delta: lonDelta_min,
    },
    initial_region: {
        latitude: 0.0,
        longitude: 0.0,
        latitudeDelta: 0.005,
        longitudeDelta: 0.0010,
    },
    region: {
        latitude: 0.0,
        longitude: 0.0,
        latitudeDelta: 0.005,
        longitudeDelta: 0.0010,
    },
      viewProps: {
      detailValue: 3,
      mapTypeString: 'dark',
      centerAt: 'runner',
      zoomLevel: 17,
    },
  };

export type OfflineLocationData = {locations: GPS_Data[];};
export const LOCATION_TRACKING_TASK_NAME = 'rubytrackloc';

export const INIT_PACE_BLOCK:PaceBlockDict = {
    initial_index: -1,
    paceBlocks: [],
    paceBlockTreshold_fast:{
        pace: 4.9,
        speed: 12,
    },
    paceBlockTreshold_slow:{
        pace: 5.5,
        speed: 10,
    },
    aim_dist: {
    "fast": 200,
    "norm": null,
    "slow": null,
    "notfast": null,
    },
    aim_time: {
    "fast": null,
    "norm": null,
    "slow": null,
    "notfast": 120,
    },
};