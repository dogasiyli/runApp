import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BT_Circle_Text_GPS, Circle_Text_Error, Circle_Text_Color, DataAgeInSec, Circle_Image_Pace } from '../functions/display/buttons';
import { useAppState } from '../assets/stateContext';    
import { getFormattedDateTime, getReadableDuration } from '../asyncOperations/fileOperations';
import { SpeedTimeInfo } from '../assets/interface_definitions';
import { CoveredDistance, GeodesicResult} from '../assets/types';

interface SpeedScreenProps {
  insets: any;
  sp_tim_inf_1: SpeedTimeInfo;
  sp_tim_inf_2: SpeedTimeInfo;
  covered_dist: CoveredDistance;
}

export const SpeedScreen: React.FC<SpeedScreenProps> = ({ insets,sp_tim_inf_1, sp_tim_inf_2, covered_dist }) => {
    const row_tops = ["5%", "30%", "53%", "89%", "140%"];
    const { current_location, 
        activeTime, passiveTime, totalTime, position_dict
      } = useAppState();

  // Use the state variables from the context as needed in this component

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
    <StatusBar style="auto" />

    {/*--------ROW 1----------*/}
    <BT_Circle_Text_GPS renderBool={true} top="8%" left="4%"/>

    {/*current time*/}
    <Circle_Text_Error renderBool={true} 
                       dispVal={getFormattedDateTime("dateclock")}
                       floatVal={-1}
                       tresholds={[2, 4, 6]} top={row_tops[0]} left="25%"
                       afterText='' beforeText=''/>
                       
    {/*last data acquisition*/}
    <DataAgeInSec renderBool={true} top={row_tops[0]} left="75%" current_location={current_location}/>

    {/*--------ROW 2----------*/}
    {/*total time*/}
    <Circle_Text_Color renderBool={true} 
                       dispVal={getReadableDuration(totalTime)}
                       floatVal={-1}
                       backgroundColor="rgb(200,200,200)" top={row_tops[1]} left="10%"
                       afterText='Total' beforeText=''/>
    {/*active time*/}
    <Circle_Text_Color renderBool={true}
                        dispVal={getReadableDuration(activeTime)}
                        floatVal={-1}
                        backgroundColor="rgb(0,100,0)" top={row_tops[1]} left="40%"
                        afterText='Active' beforeText=''/>
    {/*passive time*/}
    <Circle_Text_Color renderBool={true}
                        dispVal={getReadableDuration(passiveTime)}
                        floatVal={-1}
                        backgroundColor="#505050" top={row_tops[1]} left="70%"
                        afterText='Passive' beforeText=''/>

    {/*--------ROW 3----------*/}
    {/*total distance*/}
    <Circle_Text_Color renderBool={true} 
                       dispVal={covered_dist.distance_all.toFixed(0) + "m"}
                       floatVal={11}
                       backgroundColor="rgb(0,100,200)" top={row_tops[2]} left="25%"
                       afterText='Tot.Dist.' beforeText=''/>
    {/*to start point distance*/}
    <Circle_Text_Color renderBool={true}
                        dispVal={covered_dist.distance_last.toFixed(0) + "m"}
                        floatVal={6}
                        backgroundColor="rgb(0,100,100)" top={row_tops[2]} left="55%"
                        afterText='To Start' beforeText=''/>



    <Text style={{backgroundColor:"transparent", top:"35%", marginBottom:-50, textAlign: 'center', color:"black", fontSize:30} }>
        ----------------------------------------------
    </Text>
    <Text style={{top:"40%", marginBottom:"5%", textAlign: 'center', color:"white", fontSize:20} }>
        TIME(40s, 20s, 5s)
    </Text>
    {/*--------ROW 4----------*/}
    <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s60} time_diff={sp_tim_inf_1.t60} top={row_tops[3]} left="5%" beforeText={'seconds'}/>
    <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s30} time_diff={sp_tim_inf_1.t30} top={row_tops[3]} left="40%" beforeText={'seconds'}/>
    <Circle_Image_Pace renderBool={sp_tim_inf_1 !== undefined} speed_kmh={sp_tim_inf_1.s10} time_diff={sp_tim_inf_1.t10} top={row_tops[3]} left="75%" beforeText={'seconds'}/>

    <Text style={{backgroundColor:"transparent", top:"59%", marginBottom:"-12%", textAlign: 'center', color:"black", fontSize:30} }>
        ----------------------------------------------
    </Text>
    <Text style={{top:"63%", bottom:0, textAlign: 'center', color:"white", fontSize:20} }>
        DIST(1km, 500m, 100m)
    </Text>
    {/*--------ROW 5----------*/}
    <Circle_Image_Pace renderBool={sp_tim_inf_2 !== undefined} speed_kmh={sp_tim_inf_2.s60} time_diff={sp_tim_inf_2.t60} top={row_tops[4]} left="5%" beforeText={'meters'}/>
    <Circle_Image_Pace renderBool={sp_tim_inf_2 !== undefined} speed_kmh={sp_tim_inf_2.s30} time_diff={sp_tim_inf_2.t30} top={row_tops[4]} left="40%" beforeText={'meters'}/>
    <Circle_Image_Pace renderBool={sp_tim_inf_2 !== undefined} speed_kmh={sp_tim_inf_2.s10} time_diff={sp_tim_inf_2.t10} top={row_tops[4]} left="75%" beforeText={'meters'}/>

    </View>
  );
};
