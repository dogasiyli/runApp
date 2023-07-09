import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { BT_SwitchingImages, Circle_Text_Color } from '../functions/display/buttons';
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
        mapData, setMapData,
        runState, setRunState,
        arr_location_history, pos_array_diffs,
      } = useAppState();
     
      const handleMapValueChange = (val:number) => {
        setMapData((prevMapData) => ({
          ...prevMapData,
          viewProps: {
            ...prevMapData.viewProps,
            detailValue: val,
          },
        }));
      };
      const handleMapTypeStringChange = (val:string) => {
        console.log("handleMapTypeStringChange---map type changed to: ", val)
        setMapData((prevMapData) => ({
          ...prevMapData,
          viewProps: {
            ...prevMapData.viewProps,
            mapTypeString: val,
          },
        }));
      };

      const init_pos = {lat: 0, lon: 0};
      const map_type_strings = ["dark", "aubergine","retro","silver","standard"];
      const map_styles = {
        "aubergine_333" : require('../assets/map_styles/aubergine_333.json'),
        "aubergine_444" : require('../assets/map_styles/aubergine_444.json'),
        "dark_333" : require('../assets/map_styles/dark_333.json'),
        "dark_444" : require('../assets/map_styles/dark_444.json'),
        "retro_333" : require('../assets/map_styles/retro_333.json'),
        "retro_444" : require('../assets/map_styles/retro_444.json'),
        "silver_333" : require('../assets/map_styles/silver_333.json'),
        "silver_444" : require('../assets/map_styles/silver_444.json'),
        "standard_333" : require('../assets/map_styles/standard_333.json'),
        "standard_444" : require('../assets/map_styles/standard_444.json'),
      }
      const [mapStyle, setMapStyle] = useState(map_styles[mapData.viewProps.mapTypeString+"_"+mapData.viewProps.detailValue.toFixed(0).repeat(3)]);

      useEffect(() => {
        const fname = mapData.viewProps.mapTypeString+'_'+mapData.viewProps.detailValue.toFixed(0).repeat(3);
        console.log("map style changed to: ", fname)
        setMapStyle(map_styles[fname]);
        //console.log("map style changed to: ", map_style[0]["stylers"]);
      }, [mapData.viewProps.detailValue, mapData.viewProps.mapTypeString]);

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

    <BT_SwitchingImages renderBool={true} top="15%" left="50%" im_current={mapData.viewProps.mapTypeString} possible_images={map_type_strings}
                        setNewImg={handleMapTypeStringChange} size={0.2} press_type="both" />

    <View style={{flex: 1, flexDirection:"row", alignSelf: 'center', alignItems:"center", alignContent:"center", 
                  top:"10%", left:"40%", position:"absolute",
                  width: '50%' }}>
     <Text style={{ alignSelf: 'center', color: 'white' }}>
        Detail({mapData.viewProps.detailValue.toFixed(0)})
      </Text>
     <Slider
        style={{width: '80%', alignSelf: 'center' }}
        minimumValue={3}
        maximumValue={4}
        step={1}
        value={mapData.viewProps.detailValue}
        onValueChange={handleMapValueChange}
      />
    </View>
  

    <View style={{flex: 1, position:"absolute", alignItems:"center", justifyContent:"center", top:"30%"}}>
    <Text style={{color:"white"}}>{mapData.region.latitude !== 0.0 ? "Your Position on Earth" : "Waiting For Location"}</Text> 
    {mapData.region.latitude === 0.0 
        ? (<Text style={{ color: "white" }}>Waiting For Location</Text>) 
        : (
       <MapView provider={PROVIDER_GOOGLE} 
                style={{backgroundColor:"#fff", width:310,height:300,}}
                initialRegion={mapData.initial_region}
                showsUserLocation={true}
                showsCompass={true}
                rotateEnabled={true}
                zoomEnabled={true}
                region={mapData.region}
                customMapStyle={mapStyle}
          >
          <Marker
                coordinate={{latitude: init_pos.lat, longitude: init_pos.lon}}
                title="this is a marker"
                description="this is a marker example"
              />
            {mapData.locations.length > 0 &&  
              mapData.locations.map((location: IMapLocation, index: number) => (
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
                         arr_location_history={arr_location_history} pos_array_diffs={pos_array_diffs}
                         runState={runState} setRunState={setRunState} current_location={current_location}
                         top={80}
    />


    </View>
  );
};
