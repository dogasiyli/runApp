import * as Location from "expo-location";
export const useLocation = async (setLocation, fore_back:string) => {
  const currentLocation = await Location.getCurrentPositionAsync({});
  setLocation(currentLocation);
};