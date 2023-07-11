import { OfflineLocationData } from "../assets/constants";
import { IMapLocation } from "../assets/interface_definitions";
import { calc_geodesic } from "./utils";


export const on_new_gps_data = (data, set_current_location) => {
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
        
          console.log(
            `${index + 1}. ${new Date(timestamp).toLocaleString()}: lat(${latitude}), lon(${longitude}), acc(${accuracy}), ${speed}, ${heading}, ${altitude}, ${altitudeAccuracy}, ${timestamp}`
          );

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

export const isLocationFarEnough = async (curLoc:IMapLocation, locations:Array<IMapLocation>) => {
  const distanceThreshold = 20; // Minimum distance threshold in meters

  if (!locations || locations.length===0)
  {
    console.log("NO LOCATIONS YET")
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
    console.log("NO LOCATIONS YET");
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