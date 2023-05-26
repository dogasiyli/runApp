import * as Location from "expo-location";
import * as MediaLibrary from 'expo-media-library';
import { INIT_PERMITS, INIT_TIMES, LOCATION_TRACKING } from "../assets/constants";
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

export function useLocationForeground(): Promise<Location.LocationObject> {
  return new Promise<Location.LocationObject>(async (resolve, reject) => {
    try {
      const watchId = await Location.watchPositionAsync(
        {
          accuracy: 6,
          timeInterval: INIT_TIMES["gpsUpdateMS"],
          distanceInterval: 3,
        },
        (current_loc) => {
          resolve(current_loc); // Resolve the promise with the location
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

//set_location_background_started

export const startBackgroundLocationTracking = async () => {
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Location.Accuracy.Highest,
        timeInterval: INIT_TIMES["gpsUpdateMS"],
        distanceInterval: 0,
        showsBackgroundLocationIndicator: true,
    });
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING);
    return hasStarted;
};

  // 2. Register the task at some point in your app by providing the same name,
  // and some configuration options for how the background fetch should behave
  // Note: This does NOT need to be in the global scope and CAN be used in your React components!
  export const registerBackgroundFetchAsync = async () => {
    return BackgroundFetch.registerTaskAsync(LOCATION_TRACKING, {
      minimumInterval: 3, // 60 * 15 equals to 15 minutes hence this is in seconds
      stopOnTerminate: false, // android only,
      startOnBoot: true, // android only
    });
  }

export const stopBackgroundLocationTracking = (set_location_background_started) => {
  set_location_background_started(false);
  TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING)
      .then((tracking) => {
          if (tracking) {
              Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
          }
      })
}

const useMediaLibrary = async () => {
  const mediaLibraryResult = await MediaLibrary.requestPermissionsAsync(true);
  return mediaLibraryResult;
};

//getPermits("locationFore,locationBack,mediaLibrary")
export const getPermits = async (permitList:string) => {
  let permits = INIT_PERMITS
  console.log("Will check permits")
  if (permitList.includes('locationForeGround'))
  {
    console.log("requestForegroundPermissionsAsync...")
    let {status} = await Location.requestForegroundPermissionsAsync();
    console.log("status of requestForegroundPermissionsAsync:", status)
    permits["locationFore"] = status=='granted';
  }
  if (permitList.includes('locationBackGround'))
  {
    console.log("requestBackgroundPermissionsAsync...")
    let {status} = await Location.requestBackgroundPermissionsAsync();
    console.log("status of requestBackgroundPermissionsAsync:", status)
    permits["locationBack"] = status=='granted';
  }
  if (permitList.includes('mediaLibrary'))
  {
    console.log("request use MediaLibrary...")
    let {granted} = await useMediaLibrary();
    console.log("status of useMediaLibrary:", granted)
    permits["mediaLibrary"] = granted;
  }
  console.log("permits:", permits)
  return permits;
};