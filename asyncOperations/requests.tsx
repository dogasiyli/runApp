import * as Location from "expo-location";
import * as MediaLibrary from 'expo-media-library';
import { INIT_PERMITS } from "../assets/constants";


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