import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { AreaButtonBackgroundProps, BT_SwitchingImages, Circle_Text_Color } from '../functions/display/buttons';
import { Circle_Timer_Triangle, ControlSimulationMenu, ControlsSpeedScreen } from '../functions/display/buttons_special';
import { useAppState } from '../assets/stateContext';    
import { getFormattedDateTime } from '../asyncOperations/fileOperations';

import MapView, {Marker} from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { IMapLocation, IMapPolyGroupMember } from '../assets/interface_definitions';
import { Polyline } from "react-native-maps";

interface MapScreenProps {
  insets: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ insets }) => {
    const { current_location, 
        activeTime, passiveTime, totalTime,
        bool_update_locations, enable_update_locations,
        mapRef, mapData, setMapData,
        runState, setRunState,
        arr_location_history, pos_array_diffs,
        simulationParams, setSimulationParams,
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
      const handleMapZoom = (val:number) => {
        setMapData((prevMapData) => ({
          ...prevMapData,
          viewProps: {
            ...prevMapData.viewProps,
            zoomLevel: val,
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
      const handleMapZoomAtChange = (val:'runner' | 'map') => {
        console.log("handleMapZoomAtChange---map type changed to: ", val)
        setMapData((prevMapData) => ({
          ...prevMapData,
          viewProps: {
            ...prevMapData.viewProps,
            centerAt: val,
          },
        }));
      };

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


      const calculateMarkerColor = (markerIndex: number, maxMarkerCount:number) => {
        const max_tresholds = [0, 5, 10, 15]; // Maximum thresholds array
        //const line_colors = ["#333300","#777700", "#336600", "#66ff00", "#2244ff"]; // Colors array
        const line_colors = ["#777700","#ffff00", "#336600", "#66ff00", "#00ff00"]; // Colors array
        //const line_colors = ["#ff0000","#00ff00", "#0000ff", "#ff00ff", "#ffff00"]; // Colors array
        try {
          const clampedMarkerID = Math.max(max_tresholds[0], Math.min(max_tresholds[max_tresholds.length - 1], markerIndex));
          let index1 = 0;
          for (let i = 1; i < max_tresholds.length - 1; i++) {
            if (clampedMarkerID >= max_tresholds[i] && clampedMarkerID < max_tresholds[i + 1]) {
              index1 = i;
              break;
            }
          }
          const index2 = Math.min(index1 + 1, line_colors.length - 1);
          const color1 = line_colors[index1];
          const color2 = line_colors[index2];
          const percentage = index1 === index2 ? 1.0 : (clampedMarkerID - max_tresholds[index1]) / (max_tresholds[index2] - max_tresholds[index1]);

          const R = Math.round(parseInt(color1.slice(1, 3), 16) * (1 - percentage) + parseInt(color2.slice(1, 3), 16) * percentage);
          const G = Math.round(parseInt(color1.slice(3, 5), 16) * (1 - percentage) + parseInt(color2.slice(3, 5), 16) * percentage);
          const B = Math.round(parseInt(color1.slice(5, 7), 16) * (1 - percentage) + parseInt(color2.slice(5, 7), 16) * percentage);

          return `rgb(${isNaN(R) ? 0 : R}, ${isNaN(G) ? 0 : G}, ${isNaN(B) ? 0 : B})`;
        } catch (e) {
          return `rgb(255, 0, 0)`;
        }
      };

      function CustomMarker({ val, maxVal, showNumbers=false }: { val: number; maxVal: number; showNumbers:boolean }) {
        const backgroundColor = `rgb(0, 255, 0)`;//calculateMarkerColor(val,maxVal);
        const zIndex = 5+10*(val/maxVal);
        return (
          <View style={{ paddingVertical: 2, paddingHorizontal: 2, backgroundColor: backgroundColor, borderColor: "#eee", borderRadius: 10, elevation: 10, zIndex:zIndex }}>
            <Text style={{ color: "#fff", fontSize: 8 }}>
              {showNumbers ? val : "    "}
            </Text>
          </View>
        );
      }
   
      const usePolyLines = true;
      const POLY_LINE_COLORS = {"dark": "#fff","aubergine": "#8ec3b9","retro": "#447530","silver": "#9eaa9e","standard": "#a43a22"};
      const COL_Underlay = {"dark": "#ff0","aubergine": "#8ec3b9","retro": "#447530","silver": "#9eaa9e","standard": "#a43a22"};
      const COL_ImgBcg = {"dark": "#ff0","aubergine": "#8ec3b9","retro": "#447530","silver": "#9eaa9e","standard": "#a43a22"};
      const COL_ImgTxt = {"dark": "#ff0","aubergine": "#8ec3b9","retro": "#447530","silver": "#444","standard": "#a43a22"};
      const COL_Border1 = {"dark": "#ff0","aubergine": "#8ec3b9","retro": "#447530","silver": "#9eaa9e","standard": "#a43a22"};
      const COL_Border2 = {"dark": "#000","aubergine": "#8ec3b9","retro": "#447530","silver": "#9eaa9e","standard": "#a43a22"};
      const showRunner = true;

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
      <StatusBar style="auto" />


      {/*--------ROW 0-COL 1----------*/}{/*current time*/}
      <Circle_Text_Color renderBool={false} 
                        dispVal={getFormattedDateTime("onlyclock")}
                        floatVal={-1}
                        circleSize={0.24}
                        top="-5%" left="5%"
                        afterText='' beforeText='Now:'
                        textColor='white'
                        backgroundColor='transparent'
                        />                     
      {/*--------ROW 0-COL 2/3----------*/}
      <Circle_Timer_Triangle renderBool={false}
                            top={25} left={10}
                              activeTime={activeTime} passiveTime={passiveTime} totalTime={totalTime}
                              />






      <View style={{flex: 1, flexDirection:"row", alignSelf: 'center', alignItems:"center", alignContent:"center", 
                    top:"3%", left:"25%", position:"absolute",
                    width: '45%' }}>
      <Text style={{ alignSelf: 'center', marginRight:10, color:  COL_ImgTxt[mapData.viewProps.mapTypeString]} }>
          Detail({mapData.viewProps.detailValue.toFixed(0)}) 
        </Text>
      <Slider
          style={{width: '30%', alignSelf: 'center', backgroundColor: COL_ImgBcg[mapData.viewProps.mapTypeString]  }}
          minimumValue={3}
          maximumValue={4}
          step={1}
          value={mapData.viewProps.detailValue}
          onValueChange={handleMapValueChange}
        />
      </View>

      <BT_SwitchingImages renderBool={true} top="2%" left="63%" im_current={mapData.viewProps.mapTypeString} possible_images={map_type_strings}
                          underlayColor={COL_Underlay[mapData.viewProps.mapTypeString]}  
                          imageBackgroundColor = {COL_ImgBcg[mapData.viewProps.mapTypeString]}
                          borderColor = {COL_Border1[mapData.viewProps.mapTypeString]}
                          txtColor={COL_ImgTxt[mapData.viewProps.mapTypeString]}
                          setNewImg={handleMapTypeStringChange} size={0.15} press_type="both" />

      <BT_SwitchingImages renderBool={true} top="12%" left="83%" im_current={mapData.viewProps.centerAt} 
                          possible_strings={['runner', 'map']} possible_images={['zoom', 'zoom']}
                          underlayColor={COL_Underlay[mapData.viewProps.mapTypeString]} 
                          borderColor = {COL_Border2[mapData.viewProps.mapTypeString]}
                          imageBackgroundColor={COL_ImgBcg[mapData.viewProps.mapTypeString]}
                          txtColor={COL_ImgTxt[mapData.viewProps.mapTypeString]}
                          setNewImg={handleMapZoomAtChange} size={0.13} press_type="both" />

      {/*--------ZOOOOOOM IN----------*/}
      <View
      style={{flex: 1,flexDirection: "row",alignSelf: "center",alignItems: "center",
        alignContent: "center",top: "26%",left: "83%",
        position: "absolute",width: "40%",
      }}
      >
      <Text style={{ color: COL_ImgTxt[mapData.viewProps.mapTypeString]} }>Zoom In</Text>
      </View>

      <View style={{flex: 1,flexDirection: "row",alignSelf: "center",alignItems: "center",
        alignContent: "center",top: "33%",left: "76%",
        position: "absolute",width: "30%", transform:[{rotate: "-90deg"}], }}>
      <Slider
        style={{ width: "80%", alignSelf: "center", backgroundColor: COL_ImgBcg[mapData.viewProps.mapTypeString] }}
        minimumValue={13}
        maximumValue={19}
        step={1}
        value={mapData.viewProps.zoomLevel}
        onValueChange={handleMapZoom}

      />
      </View>
      
      {/*--------ZOOOOOOM OUT----------*/}
      <View
      style={{flex: 1,flexDirection: "row",alignSelf: "center",alignItems: "center",
        alignContent: "center",top: "43%",left: "81%",
        position: "absolute",width: "40%",
      }}
      >
        <Text style={{ color: COL_ImgTxt[mapData.viewProps.mapTypeString] }}>Zoom Out</Text>
      </View>

  

      <View style={{flex: 1, position:"absolute", alignItems:"center", justifyContent:"center", top:"1%", width:"100%", height:"100%",zIndex:-200}}>
      {mapData.region.latitude === 0.0 
          ? (<Text style={{ color: "white" }}>Waiting For Location</Text>) 
          : (
        <MapView provider={PROVIDER_GOOGLE} 
                  style={{backgroundColor:"#fff", width:"98%",height:"99%"}}
                  ref={mapRef}
                  initialRegion={mapData.initial_region}
                  showsUserLocation={true}
                  showsCompass={false}
                  rotateEnabled={true}
                  zoomEnabled={false}
                  customMapStyle={mapStyle}
            >
              {current_location && showRunner &&  
                <View style={{flex: 1, width: 50, height: 50 }}>
                  <Marker
                    key={`location-runner`}
                    coordinate={{
                      latitude: current_location.coords.latitude,
                      longitude: current_location.coords.longitude,
                    }}
                    anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={{ width: 60, height: 60 }}>
                    <Image
                      source={require("../assets/pngs/run.png")}
                      style={{ flex: 1, width: undefined, height: undefined }} // Allow the image to fill the available space
                      resizeMode="stretch"
                    />
                  </View>
                </Marker>
                </View>
              }

              {usePolyLines && mapData.polyGroup.length > 0 && 
                mapData.polyGroup.map((pg: IMapPolyGroupMember, index: number) => (
                    pg.actType != "pause" &&
                    <Polyline
                      key={`polyline-${index}`}
                      coordinates={mapData.locations.slice(pg.from,pg.to)} //specify our coordinates
                      strokeColor={POLY_LINE_COLORS[mapData.viewProps.mapTypeString]}
                      strokeWidth={4}
                      lineDashPattern={[3]}
                    />
                )) 
              }
              { usePolyLines && mapData.polyGroup.length > 0 && false &&
                <Polyline
                  key={`polyline-lastm0`}
                  coordinates={mapData.locations.slice( Math.max(mapData.polyGroup[mapData.polyGroup.length-1].from,mapData.polyGroup[mapData.polyGroup.length-1].to-2),
                                                        mapData.polyGroup[mapData.polyGroup.length-1].to)} //specify our coordinates
                  strokeColor={"#0ff"}
                  strokeWidth={8}
                  lineDashPattern={[1,1,1]}
                />
              }

        </MapView>
          )}

      </View>

      
      <AreaButtonBackgroundProps renderBool={true} top="82%" height="22%" />
      {simulationParams.index==-1 ?
      <ControlsSpeedScreen renderBool={true} 
                          bool_update_locations={bool_update_locations} enable_update_locations={enable_update_locations}
                          arr_location_history={arr_location_history} pos_array_diffs={pos_array_diffs}
                          runState={runState} setRunState={setRunState} current_location={current_location}
                          top={83}
      />
      :
        <ControlSimulationMenu renderBool={true}
            top="86%" left="0%"
            simParams={simulationParams} setSimParams={setSimulationParams}
        />
      }

    </View>
  );
};
