import React from 'react';
import { View, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BT_Circle_Text_GPS, Circle_Text_Error, Circle_Text_Color, DataAgeInSec, Circle_Image_Pace } from '../functions/display/buttons';
import { useAppState } from '../assets/stateContext';    
import { saveToFile, saveToFile_multiple, getFormattedDateTime, getReadableDuration } from '../asyncOperations/fileOperations';
import { format_degree_to_string } from '../asyncOperations/utils';
import { SpeedTimeInfo } from '../assets/interface_definitions';
import { style_container } from '../sheets/styles';

interface DebugScreenProps {
  insets: any;
  sp_tim_inf_1: SpeedTimeInfo;
  screenText:string;
}

export const DebugScreen: React.FC<DebugScreenProps> = ({ insets, sp_tim_inf_1, screenText }) => {
    const { permits, current_location,
        bool_record_locations, arr_location_history, 
        activeTime, passiveTime, totalTime, position_dict } = useAppState();
    const save_button_disabled = !permits["mediaLibrary"] || bool_record_locations || arr_location_history.length<=1;

  // Use the state variables from the context as needed in this component

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
        <StatusBar style="auto" />

        {/*--------ROW 1----------*/}
        <BT_Circle_Text_GPS renderBool={true} top="8%" left="4%"/>

        {/*meter error*/}
        <Circle_Text_Error renderBool={true} 
                        dispVal={current_location["coords"]["accuracy"].toFixed(3)} 
                        floatVal={current_location["coords"]["accuracy"]}
                        tresholds={[7, 12, 19]} top="5%" left="25%"
                        afterText='Error(mt)'beforeText=''/>
        {/*current time*/}
        <Circle_Text_Error renderBool={true} 
                        dispVal={getFormattedDateTime("dateclock")}
                        floatVal={-1}
                        tresholds={[2, 4, 6]} top="5%" left="75%"
                        afterText='' beforeText=''/>
                        

        {/*--------ROW 2----------*/}
        {/*latitude, longitude, altitude*/}
        <Circle_Text_Error renderBool={true} 
                        dispVal={format_degree_to_string(current_location["coords"]["latitude"])} 
                        floatVal={current_location["coords"]["accuracy"]}
                        tresholds={[7, 12, 19]} top="30%" left="0%"
                        beforeText='' afterText='Latitude'/>
        <Circle_Text_Error renderBool={true} 
                        dispVal={format_degree_to_string(current_location["coords"]["longitude"])} 
                        floatVal={current_location["coords"]["accuracy"]}
                        tresholds={[7, 12, 19]} top="30%" left="25%"
                        beforeText='' afterText='Longtitude'/>
        <Circle_Text_Error renderBool={true} 
                        dispVal={format_degree_to_string(current_location["coords"]["altitude"])} 
                        floatVal={current_location["coords"]["altitudeAccuracy"]}
                        tresholds={[1, 3, 5]} top="30%" left="50%"
                        beforeText='' afterText='Altitude'/>
        {/*last data acquisition*/}
        <DataAgeInSec renderBool={true} top="30%" left="75%" current_location={current_location}/>

        {/*--------ROW 3----------*/}
        {/*total time*/}
        <Circle_Text_Color renderBool={true} 
                        dispVal={getReadableDuration(totalTime)}
                        floatVal={-1}
                        backgroundColor="rgb(200,200,200)" top="60%" left="0%"
                        afterText='Total' beforeText=''/>
        {/*active time*/}
        <Circle_Text_Color renderBool={true}
                            dispVal={getReadableDuration(activeTime)}
                            floatVal={-1}
                            backgroundColor="rgb(0,100,0)" top="60%" left="25%"
                            afterText='Active' beforeText=''/>
        {/*passive time*/}
        <Circle_Text_Color renderBool={true}
                            dispVal={getReadableDuration(passiveTime)}
                            floatVal={-1}
                            backgroundColor="#505050" top="60%" left="50%"
                            afterText='Passive' beforeText=''/>


        {/* Saved location count*/}
        <Circle_Text_Error renderBool={true}
                            dispVal={arr_location_history.length.toLocaleString()}
                            floatVal={arr_location_history.length}
                            tresholds={[10, 30, 60]} top="60%" left="75%"
                            afterText='DataPts' beforeText=''/>

        {/*--------ROW 4----------*/}

        <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s60} time_diff={sp_tim_inf_1.t60} top="110%" left="5%" beforeText={'meters'}/>
        <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s30} time_diff={sp_tim_inf_1.t30} top="110%" left="40%" beforeText={'seconds'}/>
        <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s10} time_diff={sp_tim_inf_1.t10} top="110%" left="75%" beforeText={'seconds'}/>

        <View style={{alignSelf:"center", alignItems:"center", alignContent:"center", marginTop: '80%', width: '100%'}}>
            <View>
            <Text>{screenText}</Text>
            </View>
        </View>

        <View style={style_container.container}>
            <View style={{ flexDirection: 'row' }}>
                <Button disabled={save_button_disabled} onPress={() => saveToFile(arr_location_history)} title="RecordPositions" color = {save_button_disabled ? "#ff0000" : "#00ffff"} />
                <Button disabled={save_button_disabled} onPress={() => saveToFile_multiple([arr_location_history, position_dict])} title="RecordMultiple" color = {save_button_disabled ? "#ff0000" : "#00ff00"} />
            </View>
        </View>
    </View>
  );
};
