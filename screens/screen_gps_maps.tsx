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
import { IMapLocation } from '../assets/interface_definitions';

interface MapScreenProps {
  insets: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ insets }) => {
    const { current_location, 
        activeTime, passiveTime, totalTime,
        bool_update_locations, enable_update_locations,
        mapLocations, mapRegion, 
        runState, setRunState,
      } = useAppState();
     
      const init_pos = {lat: 0, lon: 0};

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
    <Text style={{color:"white"}}>{mapRegion.latitude !== 0.0 ? "Your Position on Earth" : "Waiting For Location"}</Text> 
    {mapRegion.latitude === 0.0 
        ? (<Text style={{ color: "white" }}>Waiting For Location</Text>) 
        : (
       <MapView provider={PROVIDER_GOOGLE} 
                style={{backgroundColor:"#fff", width:310,height:300,}}
                initialRegion={mapRegion}
                showsUserLocation={true}
                showsCompass={true}
                rotateEnabled={true}
                zoomEnabled={true}
                region={mapRegion}
          >
          <Marker
                coordinate={{latitude: init_pos.lat, longitude: init_pos.lon}}
                title="this is a marker"
                description="this is a marker example"
              />
            {mapLocations.length > 0 &&  
              mapLocations.map((location: IMapLocation, index: number) => (
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
        )}

    </View>


    <ControlsSpeedScreen renderBool={true} 
                         bool_update_locations={bool_update_locations} enable_update_locations={enable_update_locations}
                         runState={runState} setRunState={setRunState} current_location={current_location}
                         top={145}
    />


    </View>
  );
};
