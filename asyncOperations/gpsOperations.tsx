import { FIXED_DISTANCES, OfflineLocationData, latDelta_min, lonDelta_min } from "../assets/constants";
import { IMapBoundaries, IMapData, IMapLocation, IMapRegion } from "../assets/interface_definitions";
import { calc_geodesic } from "./utils";

import * as TaskManager from 'expo-task-manager';
import * as Storage from '../functions/gps/storage';
import { LOCATION_TRACKING_TASK_NAME } from '../assets/constants';
import { LocationObject} from 'expo-location';
import { GPS_Data } from "../assets/types";

/**
 * Define the background task that's adding locations to the storage.
 * This method isn't "directly" connected to React, that's why we store the data locally.
 */
export const define_tracking_job = async (set_current_location) => {
  const registeredTasks = await TaskManager.getRegisteredTasksAsync();
  console.log('[tracking001]-', 'Currently registered tasks', registeredTasks);

  const isMyTaskRegistered = registeredTasks.some(task => task.taskName === LOCATION_TRACKING_TASK_NAME);
  if (isMyTaskRegistered) {
    console.log(LOCATION_TRACKING_TASK_NAME, ' is already registered.');
    return;
  } 

  TaskManager.defineTask(LOCATION_TRACKING_TASK_NAME, async (event) => {
    if (event.error) {
      return console.error('[tracking002]-', LOCATION_TRACKING_TASK_NAME + '-Something went wrong within the background location task...', event.error);
    }

    const locations = (event.data as any).locations as LocationObject[];
    console.log('[tracking003]-', LOCATION_TRACKING_TASK_NAME + '-Received new locations', locations.length);

    try {
      // have to add it sequentially, parses/serializes existing JSON
      for (const loc of locations) {
        //console.log('[tracking004]-', LOCATION_TRACKING_TASK_NAME + '-go to updateLocationData');
        await updateLocationData(loc, set_current_location);
      }
    } catch (error) {
      console.log('[tracking005]', 'Something went wrong when saving a new location...', error);
    }
  });
}

export const on_new_gps_data = (data:OfflineLocationData, set_current_location) => {
    //console.log('on_new_gps_data:', data);
    if (data) {
        const locationData: OfflineLocationData = data as OfflineLocationData; // Declare the type of data as LocationData
        locationData.locations.forEach((location, index) => {
          const {
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
            altitude,
            altitudeAccuracy
          } = location.coords;
          const timestamp = location.timestamp;
        
          //console.log(
          //  `${index + 1}. ${new Date(timestamp).toLocaleString()}: lat(${latitude}), lon(${longitude}), acc(${accuracy}), ${speed}, ${heading}, ${altitude}, ${altitudeAccuracy}, ${timestamp}`
          //);

          const CUR_POSITION = {
            "coords": 
            {
                "accuracy": accuracy, 
                "altitude": altitude, 
                "altitudeAccuracy": altitudeAccuracy, 
                "heading": heading, 
                "latitude": latitude, 
                "longitude": longitude, 
                "speed": speed
            }, 
            "mocked": true, 
            "timestamp": timestamp
          }
          set_current_location(CUR_POSITION);
        });
      }
}
/**
 * Add a new location to the storage.
 * This is a helper to append a new location to the storage.
 */
export async function addLocation(location: GPS_Data, arr_location_history:any[]): Promise<GPS_Data[]> {
  const existing = await Storage.getLocations();
  console.log("-----------------------addLocation: existing", existing.length, arr_location_history.length)
  const reinit_locations = existing.length > 1 && arr_location_history.length == 1;
  if (reinit_locations) {
    console.log("-----------------------addLocation: clearLocations")
    await Storage.clearLocations(); 
  }
  const locations = reinit_locations ? [location] : [...existing, location];
  await Storage.setLocations(locations);
  console.log('[storage]', 'added location -', locations.length, 'stored locations');
  return locations;    
}
/**
 * Add a new location to the storage.
 * This is a helper to append a new location to the storage.
 */
export async function updateLocationData(location: GPS_Data, set_current_location:any): Promise<GPS_Data[]> {
  on_new_gps_data({locations:[location]}, set_current_location);
  return;
}

export const isLocationFarEnough = async (curLoc:IMapLocation, locations:Array<IMapLocation>) => {
  const distanceThreshold = FIXED_DISTANCES["MAP_DATA_ADD"]; // Minimum distance threshold in meters

  if (!locations || locations.length===0)
  {
    //console.log("NO LOCATIONS YET")
    return true;
  }
  //console.log(locations.length, " of locations will be checked for distance")
  //for (const loc of locations) {
  const loc = locations[locations.length-1];
  //console.log("try loc: ", loc, curLoc)
  const distance = await calc_geodesic(
      { lat: curLoc.latitude, lon: curLoc.longitude },
      { lat: loc.latitude, lon: loc.longitude },
      false
  );

  if (distance)
  {
    //console.log("distance: ", distance)
    if (distance.s_geo_len < distanceThreshold) {
      return false; // Current location is not far enough from a location in the array
    }
  }
  //}

  return true; // Current location is far enough from all locations in the array
};

export const isFurtherThan = async (curLoc: IMapLocation, locations: Array<IMapLocation>, distanceToCheck: number) => {
  if (!locations || locations.length === 0) {
    //console.log("NO LOCATIONS YET");
    return false;
  }

  const lastLoc = locations[locations.length - 1];
  const distance = await calc_geodesic(
    { lat: curLoc.latitude, lon: curLoc.longitude },
    { lat: lastLoc.latitude, lon: lastLoc.longitude },
    false
  );

  if (distance && distance.s_geo_len > distanceToCheck) {
    //console.log("isFurtherThan? distance > distanceToCheck:", distance.s_geo_len, distanceToCheck);
    return true;
  }
  return false;
};

export const animate_point=async(runState, simulationParams, mapData, mapRef, current_location)=>{
  const ca = mapData.viewProps.centerAt;
  //console.log("animate_point, runState:", runState, ", simulationParams:", simulationParams.isPaused)
  if (simulationParams.isPaused || runState === "paused") 
  {
    //console.log("mapRef.current:\n", mapRef.current)
    //return;
  }
  if (mapRef !== null && mapRef.current !== null && mapData.locations.length > 0)
  {  
    mapRef.current.animateCamera({
      heading:current_location.coords.heading,
      zoom: mapData.viewProps.zoomLevel,
      center: {
        latitude:ca=='runner' ? current_location.coords.latitude : 0.5*(mapData.loc_boundaries.lat_max + mapData.loc_boundaries.lat_min),
        longitude:ca=='runner' ? current_location.coords.longitude : 0.5*(mapData.loc_boundaries.lon_max + mapData.loc_boundaries.lon_min),
      },
      pitch: 0,})
  }
};

export const updateMapInformation = async (mapData, setMapData, bool_record_locations, simulationParams, current_location) => {
  if (current_location && current_location.coords) {
    const { latitude, longitude } = current_location.coords;  
    const isFarEnough = await isLocationFarEnough(
      { latitude, longitude },
      mapData.locations
    );
    const set_new_bounds = async(newBounds:IMapBoundaries, latitude, longitude) => {
      newBounds.lat_max = Math.max(newBounds.lat_max, latitude);
      newBounds.lat_min = Math.min(newBounds.lat_min, latitude);
      newBounds.lon_max = Math.max(newBounds.lon_max, longitude);
      newBounds.lon_min = Math.min(newBounds.lon_min, longitude);
      newBounds.lat_delta = Math.max(newBounds.lat_max - newBounds.lat_min, latDelta_min);
      newBounds.lon_delta = Math.max(newBounds.lon_max - newBounds.lon_min, lonDelta_min);   
      return newBounds;       
    }
    const set_new_region = async(newRegion:IMapRegion, newBounds:IMapBoundaries, latitude:number, longitude:number) => {
      //newRegion.latitudeDelta = 2*newBounds.lat_delta;
      //newRegion.longitudeDelta = 2*newBounds.lon_delta;
      newRegion.latitude = latitude;
      newRegion.longitude = longitude;      
      return newRegion;     
    }
    const isToBeAdded = bool_record_locations || !simulationParams.isPaused;

    let newBounds = {...mapData.loc_boundaries};
    let newRegion = {
      ...mapData.region,
      latitude: latitude,
      longitude: longitude,
    };
    if (isFarEnough && isToBeAdded) {
      // add the location to the map

      newBounds = await set_new_bounds(newBounds, latitude, longitude);
      //console.log("newBounds:", newBounds);

      newRegion = await set_new_region(newRegion, newBounds, latitude, longitude);
      //console.log("newRegion:", newRegion); 

      setMapData((prevState) => ({
        ...prevState,
        locations: [...prevState.locations, { latitude, longitude }],
        loc_boundaries: newBounds,
        region: newRegion,
        initial_region: newRegion,
      }));
    }
  }
};

const isTooFar = async (mapData, polyGroupCount:number) => {
  //console.log("---isTooFar---polyGroupCount(", polyGroupCount, ')');
  if (polyGroupCount<1) return false;

  //console.log("---isTooFar---isFurtherThan:polyGroupCount(", polyGroupCount, '):', mapData.polyGroup[polyGroupCount-1].to, mapData.locations.length);
  const tooFar2BeInTheSameGroup = await isFurtherThan(
    mapData.locations[mapData.polyGroup[polyGroupCount-1].to],
    mapData.locations, FIXED_DISTANCES["POLY_GROUP_MAX_WITHIN_DISTANCE"]
  );
  //console.log("---isTooFar---tooFar2BeInTheSameGroup:polyGroupCount(", polyGroupCount, '):', tooFar2BeInTheSameGroup);

  return tooFar2BeInTheSameGroup;
};

export const updatePolyGroups = async (mapData:IMapData, setMapData:React.Dispatch<React.SetStateAction<IMapData>>) => {
  const polyGroupCount =  mapData.polyGroup.length;
  const tooFar2BeInTheSameGroup = await isTooFar(mapData, polyGroupCount);
  const map_loc_last = mapData.locations.length-1;
  //TODO check if the activity type is passed from current location etc.
  const known_activityType_last =  mapData.locations[map_loc_last-1]?.activityType ? mapData.locations[map_loc_last-1]?.activityType : undefined;
  const known_activityType_curr =  mapData.locations[map_loc_last]?.activityType ? mapData.locations[map_loc_last]?.activityType : undefined;
  let last_activityType =  polyGroupCount>0 ? mapData.polyGroup[polyGroupCount-1].actType : (known_activityType_last===undefined ? "run": known_activityType_last);
  let curr_activityType =  known_activityType_curr===undefined ? "run": known_activityType_curr;

  if (mapData.locations.length == 2) {
    //console.log("mapData.locations.length == 2")
    setMapData((prevState) => ({
      ...prevState,
      polyGroup: [...prevState.polyGroup, { from: 0, to: 1, actType: curr_activityType }],
    }));
    //console.log("11111111-BEG-mapData.polyGroup:\n", mapData.polyGroup);
    return;
  }

  curr_activityType = tooFar2BeInTheSameGroup ? "pause" : curr_activityType;
  //console.log("tooFar2BeInTheSameGroup:", tooFar2BeInTheSameGroup, ", curr_activityType:", curr_activityType, ", last_activityType:", last_activityType);
  if (curr_activityType==last_activityType)
  {
    mapData.polyGroup[polyGroupCount-1].to = map_loc_last;
    //console.log("2222222-INC-mapData.polyGroup:\n", mapData.polyGroup);
  }
  else
  {
    setMapData((prevState) => ({
      ...prevState,
      polyGroup: [...prevState.polyGroup, { from: map_loc_last-1, to: map_loc_last, actType: curr_activityType }],
    }));
    //console.log("33333333-APP-mapData.polyGroup:\n", mapData.polyGroup);
  }
}