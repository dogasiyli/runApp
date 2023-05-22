import * as Location from "expo-location";
import * as MediaLibrary from 'expo-media-library';
import { INIT_PERMITS } from "../assets/constants";

export const useLocation = async (setLocation, fore_back:string) => {
  const currentLocation = await Location.getCurrentPositionAsync({});
  setLocation(currentLocation);
};

const useMediaLibrary = async () => {
  const mediaLibraryResult = await MediaLibrary.requestPermissionsAsync(true);
  return mediaLibraryResult;
};


//getPermits("locationFore,locationBack")
export const getPermits = async (permitList:string) => {
  let permits = INIT_PERMITS
  console.log("Will check permits")
  if (permitList.includes('locationForeGround'))
  {
    console.log("requestForegroundPermissionsAsync...")
    let {status} = await Location.requestForegroundPermissionsAsync();
    console.log("satus of requestForegroundPermissionsAsync:", status)
    permits["locationFore"] = status=='granted';
  }
  if (permitList.includes('locationBackGround'))
  {
    console.log("requestBackgroundPermissionsAsync...")
    let {status} = await Location.requestBackgroundPermissionsAsync();
    console.log("satus of requestBackgroundPermissionsAsync:", status)
    permits["locationBack"] = status=='granted';
  }
  if (permitList.includes('mediaLibrary'))
  {
    console.log("requestuseMediaLibrary...")
    let {granted} = await useMediaLibrary();
    console.log("satus of useMediaLibrary:", granted)
    permits["mediaLibrary"] = granted;
  }
  console.log("permits:", permits)
  return permits;
};