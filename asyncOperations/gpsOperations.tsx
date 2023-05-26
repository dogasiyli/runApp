import { OfflineLocationData } from "../assets/constants";


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
