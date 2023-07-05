import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { Circle_Text_Color } from '../functions/display/buttons';
import { Circle_Timer_Triangle, ControlsSpeedScreen } from '../functions/display/buttons_special';
import { useAppState } from '../assets/stateContext';    
import { getFormattedDateTime } from '../asyncOperations/fileOperations';

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
     
      const [mapDetailValue, setMapDetailValue] = useState(3);
      const handleMapValueChange = (val:number) => {
        setMapDetailValue(val);
      };
      const [mapTypeInt, setMapTypeInt] = useState(1);
      const [mapTypeString, setMapTypeString] = useState('dark');
      const handleMapTypeIntChange = (val:number) => {
        setMapTypeInt(val);
      };

      const init_pos = {lat: 0, lon: 0};
      const map_type_strings = ["dark", "aubergine"];
      const map_styles = {
        "aubergine_111" : require('../assets/map_styles/aubergine_111.json'),
        "aubergine_222" : require('../assets/map_styles/aubergine_222.json'),
        "aubergine_333" : require('../assets/map_styles/aubergine_333.json'),
        "aubergine_444" : require('../assets/map_styles/aubergine_444.json'),
        "dark_111" : require('../assets/map_styles/dark_111.json'),
        "dark_222" : require('../assets/map_styles/dark_222.json'),
        "dark_333" : require('../assets/map_styles/dark_333.json'),
        "dark_444" : require('../assets/map_styles/dark_444.json'),
      }
      let map_style = map_styles[mapTypeString+"_"+mapDetailValue.toFixed(0).repeat(3)];

      useEffect(() => {
        const newMapTypeString = map_type_strings[mapTypeInt-1];
        setMapTypeString(newMapTypeString);
        const fname = newMapTypeString+'_'+mapDetailValue.toFixed(0).repeat(3);
        console.log("fname: ", fname)
        map_style = map_styles[fname];
      }, [mapDetailValue, mapTypeInt]);

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

    <View style={{flex: 1, flexDirection:"row", alignSelf: 'center', alignItems:"center", alignContent:"center", 
                  top:"24%", left:"36%", position:"absolute",
                  width: '50%' }}>
     <Text style={{ alignSelf: 'center', color: 'white' }}>
        Type({mapTypeString.slice(0,4)})
      </Text>
      <Slider
        style={{width: '80%', alignSelf: 'center' }}
        minimumValue={1}
        maximumValue={2}
        step={1}
        value={mapTypeInt}
        onValueChange={handleMapTypeIntChange}
      />
    </View>

    <View style={{flex: 1, flexDirection:"row", alignSelf: 'center', alignItems:"center", alignContent:"center", 
                  top:"20%", left:"40%", position:"absolute",
                  width: '50%' }}>
     <Text style={{ alignSelf: 'center', color: 'white' }}>
        Detail({mapDetailValue})
      </Text>
     <Slider
        style={{width: '80%', alignSelf: 'center' }}
        minimumValue={1}
        maximumValue={4}
        step={1}
        value={mapDetailValue}
        onValueChange={handleMapValueChange}
      />
    </View>
  

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
                customMapStyle={map_style}
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
