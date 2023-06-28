import { LocationObject } from "expo-location";
import { SpeedTimeCalced } from "./types";

export const CALC_DISTANCES_FIXED = [200, 100, 50];
export const CALC_TIMES_FIXED = [60, 30, 10];

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

export type OfflineLocationData = {locations: LocationObject[];};
export const LOCATION_TRACKING = 'location-tracking';
export const LOCATION_TRACKING_BACKGROUND = 'location-tracking';