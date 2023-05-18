import * as Location from "expo-location";
import * as MediaLibrary from 'expo-media-library';

export const useLocation = async (setLocation, fore_back:string) => {
  const currentLocation = await Location.getCurrentPositionAsync({});
  setLocation(currentLocation);
};

export const useMediaLibrary = async (setPermittedMediaLibrary) => {
  const mediaLibraryResult = await MediaLibrary.requestPermissionsAsync(true);
  setPermittedMediaLibrary(mediaLibraryResult.granted);
  console.log("mediaLibraryResult:",mediaLibraryResult);
};