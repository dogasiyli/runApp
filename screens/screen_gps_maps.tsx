import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Circle_Text_Color } from '../functions/display/buttons';
import { Circle_Timer_Triangle, ControlsSpeedScreen } from '../functions/display/buttons_special';
import { useAppState } from '../assets/stateContext';    
import { getFormattedDateTime } from '../asyncOperations/fileOperations';
import { calc_geodesic } from '../asyncOperations/utils';

import MapView, {Marker} from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';

interface MapScreenProps {
  insets: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ insets }) => {
    const { current_location, 
        activeTime, passiveTime, totalTime,
        bool_update_locations, enable_update_locations,
        runState, setRunState,
      } = useAppState();

      interface ILocation {
        latitude: number;
        longitude: number;
      }
      const [locations, setLocations] = useState<Array<ILocation>>([]);
      const init_pos = {"lat": 41.08694, "lon": 29.01016};

      const [region, setRegion] = React.useState({
        latitude: 41.0869456,
        longitude: 29.0101637,
        latitudeDelta: 0.005,
        longitudeDelta: 0.0010
      })

      const isLocationFarEnough = async (curLoc:ILocation, locations:Array<ILocation>) => {
        const distanceThreshold = 20; // Minimum distance threshold in meters

        if (!locations || locations.length===0)
        {
          console.log("NO LOCATIONS YET")
          return true;
        }
        console.log(locations.length, " of locations will be checked for distance")
        for (const loc of locations) {
          console.log("try loc: ", loc, curLoc)
          const distance = await calc_geodesic(
            { lat: curLoc.latitude, lon: curLoc.longitude },
            { lat: loc.latitude, lon: loc.longitude },
            false
          );

          if (distance)
          {
            console.log("distance: ", distance)
            if (distance.s_geo_len < distanceThreshold) {
              return false; // Current location is not far enough from a location in the array
            }
          }
        }
      
        return true; // Current location is far enough from all locations in the array
      };

      useEffect(() => {
        if (current_location && current_location.coords) {
          const { latitude, longitude } = current_location.coords;
      
          const checkLocation = async () => {
            const isFarEnough = await isLocationFarEnough(
              { latitude, longitude },
              locations
            );
      
            if (isFarEnough) {
              setLocations([...locations, { latitude, longitude }]);
            }
      
            setRegion((prevRegion) => ({
              ...prevRegion,
              latitude,
              longitude,
            }));
          };
      
          checkLocation();
        }
      }, [current_location]);

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
    <StatusBar style="auto" />


    {/*--------ROW 0-COL 1----------*/}{/*current time*/}
    <Circle_Text_Color renderBool={true} 
                       dispVal={getFormattedDateTime("onlyclock")}
                       floatVal={-1}
                       circleSize={0.24}
                       top="-5%" left="5%"
                       afterText='' beforeText='Now:'
                       textColor='white'
                       backgroundColor='transparent'
                       />                     
    {/*--------ROW 0-COL 2/3----------*/}
    <Circle_Timer_Triangle renderBool={true}
                           top={25} left={10}
                            activeTime={activeTime} passiveTime={passiveTime} totalTime={totalTime}
                            />
  

    <View style={{flex: 1, position:"absolute", alignItems:"center", justifyContent:"center", top:"30%"}}>
      <Text style={{color:"white"}}>{"Your Position on Earth"}</Text>   
      <MapView provider={PROVIDER_GOOGLE} 
               style={{backgroundColor:"#fff", width:310,height:300,}}
               initialRegion={region}
               showsUserLocation={true}
               showsCompass={true}
               rotateEnabled={true}
               zoomEnabled={true}
               region={region}
         >
          <Marker
            coordinate={{latitude: init_pos.lat, longitude: init_pos.lon}}
            title="this is a marker"
            description="this is a marker example"
          />
          

           {locations.length > 0 &&  
            locations.map((location: ILocation, index: number) => (
            <Marker
              key={`location-${index}`}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={`Location ${index + 1}`}
              description={`Latitude: ${location.latitude} \nLongitude: ${location.longitude}`}
              pinColor='blue'
            />
          ))}

        </MapView>
    </View>


    <ControlsSpeedScreen renderBool={true} 
                         bool_update_locations={bool_update_locations} enable_update_locations={enable_update_locations}
                         runState={runState} setRunState={setRunState} current_location={current_location}
                         top={145}
    />


    </View>
  );
};
