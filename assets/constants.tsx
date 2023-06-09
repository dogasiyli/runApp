import { LocationObject } from "expo-location";

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

export type OfflineLocationData = {locations: LocationObject[];};
export const LOCATION_TRACKING = 'location-tracking';
export const LOCATION_TRACKING_BACKGROUND = 'location-tracking';