import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BT_Circle_Text_GPS, Circle_Text_Error, Circle_Text_Color, Circle_Image_Pace } from '../functions/display/buttons';
import { useAppState } from '../assets/stateContext';    
import { getFormattedDateTime, getReadableDuration } from '../asyncOperations/fileOperations';
import { CoveredDistance, SpeedTimeCalced_Dict, stDict_hasKey} from '../assets/types';
import { CALC_DISTANCES_FIXED, CALC_TIMES_FIXED } from '../assets/constants';

interface SpeedScreenProps {
  insets: any;
  stDict: SpeedTimeCalced_Dict;
  covered_dist: CoveredDistance;
}

export const SpeedScreen: React.FC<SpeedScreenProps> = ({ insets,stDict, covered_dist }) => {
    const row_tops = ["5%", "1%", "18%", "89%", "140%"];
    const { current_location, 
        activeTime, passiveTime, totalTime,
      } = useAppState();
    //const esa = [1001, 60*1000+1001, 10*60*1000+1001, 61*60*1000+1001,90*61*60*1000+1001];
    //const elapsedTime = esa[4];
    //const covered_dist_distance_last = 25000.001;
    //const covered_dist_distance_all = covered_dist_distance_last;

  // Use the state variables from the context as needed in this component
  const last_or_best_dist = "last";
  const last_or_best_time = "last";

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "purple" }}>
    <StatusBar style="auto" />

    {/*--------ROW 0-COL 0----------*/}
    <BT_Circle_Text_GPS renderBool={true} top="8%" left="4%"/>
    {/*--------ROW 0-COL 1----------*/}{/*current time*/}
    <Circle_Text_Error renderBool={true} 
                       dispVal={getFormattedDateTime("dateclock")}
                       floatVal={-1}
                       tresholds={[2, 4, 6]} top={row_tops[0]} left="20%"
                       afterText='' beforeText=''/>                     
    {/*--------ROW 0-COL 2/3----------*/}
    {/*total time*/}
    <Circle_Text_Color renderBool={true} 
                       dispVal={getReadableDuration(totalTime)}
                       floatVal={Math.max(totalTime,activeTime,passiveTime)}
                       circleSize={Math.max(totalTime,activeTime,passiveTime)}
                       backgroundColor="rgb(200,200,200)" top={-1} left={-1}
                       afterText='' beforeText=''/>
    {/*active time*/}
    <Circle_Text_Color renderBool={true}
                        dispVal={getReadableDuration(activeTime)}
                        floatVal={Math.max(totalTime,activeTime,passiveTime)}
                        circleSize={Math.max(totalTime,activeTime,passiveTime)}
                        backgroundColor="rgb(0,100,0)" top={-1} left={1}
                        afterText='' beforeText=''/>
    {/*passive time*/}
    <Circle_Text_Color renderBool={true}
                        dispVal={getReadableDuration(passiveTime)}
                        floatVal={Math.max(totalTime,activeTime,passiveTime)}
                        circleSize={Math.max(totalTime,activeTime,passiveTime)}
                        backgroundColor="#505050" top={1} left={0}
                        afterText='' beforeText=''/>

    {/*--------ROW 3----------*/}
    {/*total distance*/}
    <Circle_Text_Color renderBool={true} 
                       dispVal={covered_dist.distance_all.toFixed(0) + "m"}
                       floatVal={11}
                       circleSize={0.10 + 0.012*Math.floor(Math.log10(covered_dist.distance_all+0.001))}
                       backgroundColor="rgb(0,100,200)" top={row_tops[1]} left="80%"
                       afterText='' beforeText=''/>
    {/*to start point distance*/}
    <Circle_Text_Color renderBool={true}
                        dispVal={covered_dist.distance_last.toFixed(0) + "m"}
                        floatVal={6}
                        circleSize={0.10 + 0.012*Math.floor(Math.log10(covered_dist.distance_last+0.001))}
                        backgroundColor="rgb(0,100,100)" top={row_tops[2]} left="80%"
                        afterText='' beforeText=''/>



    <Text style={{backgroundColor:"transparent", top:"35%", marginBottom:-50, textAlign: 'center', color:"black", fontSize:30} }>
        ----------------------------------------------
    </Text>
    <Text style={{top:"40%", marginBottom:"5%", textAlign: 'center', color:"white", fontSize:20} }>
        TIME(40s, 20s, 5s)
    </Text>
    {/*--------ROW 4----------*/}
    <Circle_Image_Pace renderBool={stDict !== undefined} 
                       speed_kmh={stDict_hasKey(stDict, `${CALC_TIMES_FIXED[0].toFixed(0)}s`) ? (
                                  last_or_best_time === "last" ? stDict[`${CALC_TIMES_FIXED[0].toFixed(0)}s`].last_speed
                                                               : stDict[`${CALC_TIMES_FIXED[0].toFixed(0)}s`].best_speed) : 0
                                  } 
                       time_diff={stDict_hasKey(stDict, `${CALC_TIMES_FIXED[0].toFixed(0)}s`) ? (
                                  last_or_best_time === "last" ? stDict[`${CALC_TIMES_FIXED[0].toFixed(0)}s`].last_time
                                                               : stDict[`${CALC_TIMES_FIXED[0].toFixed(0)}s`].best_time) : 0
                                  } 
                       top={row_tops[3]} left="5%" beforeText={'seconds'}/>
    <Circle_Image_Pace renderBool={stDict !== undefined} 
                       speed_kmh={stDict_hasKey(stDict, `${CALC_TIMES_FIXED[1].toFixed(0)}s`) ? (
                        last_or_best_time === "last" ? stDict[`${CALC_TIMES_FIXED[1].toFixed(0)}s`].last_speed
                                                     : stDict[`${CALC_TIMES_FIXED[1].toFixed(0)}s`].best_speed) : 0
                        } 
                        time_diff={stDict_hasKey(stDict, `${CALC_TIMES_FIXED[1].toFixed(0)}s`) ? (
                        last_or_best_time === "last" ? stDict[`${CALC_TIMES_FIXED[1].toFixed(0)}s`].last_time
                                                     : stDict[`${CALC_TIMES_FIXED[1].toFixed(0)}s`].best_time) : 0
                        } 
                        top={row_tops[3]} left="40%" beforeText={'seconds'}/>
    <Circle_Image_Pace renderBool={stDict !== undefined} 
                       speed_kmh={stDict_hasKey(stDict, `${CALC_TIMES_FIXED[2].toFixed(0)}s`) ? (
                        last_or_best_time === "last" ? stDict[`${CALC_TIMES_FIXED[2].toFixed(0)}s`].last_speed
                                                     : stDict[`${CALC_TIMES_FIXED[2].toFixed(0)}s`].best_speed) : 0
                        } 
                        time_diff={stDict_hasKey(stDict, `${CALC_TIMES_FIXED[2].toFixed(0)}s`) ? (
                        last_or_best_time === "last" ? stDict[`${CALC_TIMES_FIXED[2].toFixed(0)}s`].last_time
                                                     : stDict[`${CALC_TIMES_FIXED[2].toFixed(0)}s`].best_time) : 0
                        } 
                       top={row_tops[3]} left="75%" beforeText={'seconds'}/>

    <Text style={{backgroundColor:"transparent", top:"59%", marginBottom:"-12%", textAlign: 'center', color:"black", fontSize:30} }>
        ----------------------------------------------
    </Text>
    <Text style={{top:"63%", bottom:0, textAlign: 'center', color:"white", fontSize:20} }>
        DIST(1km, 500m, 100m)
    </Text>
    {/*--------ROW 5----------*/}
    <Circle_Image_Pace renderBool={stDict !== undefined} 
                        speed_kmh={stDict_hasKey(stDict, `${CALC_DISTANCES_FIXED[0].toFixed(0)}m`) ? (
                        last_or_best_dist === "last" ? stDict[`${CALC_DISTANCES_FIXED[0].toFixed(0)}m`].last_speed
                                                     : stDict[`${CALC_DISTANCES_FIXED[0].toFixed(0)}m`].best_speed) : 0} 
                        time_diff={stDict_hasKey(stDict, `${CALC_DISTANCES_FIXED[0].toFixed(0)}m`) ? (
                        last_or_best_dist === "last" ? stDict[`${CALC_DISTANCES_FIXED[0].toFixed(0)}m`].last_time
                                                     : stDict[`${CALC_DISTANCES_FIXED[0].toFixed(0)}m`].best_time) : 0} 
                       top={row_tops[4]} left="5%" beforeText={'meters'}/>
    <Circle_Image_Pace renderBool={stDict !== undefined} 
                       speed_kmh={stDict_hasKey(stDict, `${CALC_DISTANCES_FIXED[1].toFixed(0)}m`) ? (
                        last_or_best_dist === "last" ? stDict[`${CALC_DISTANCES_FIXED[1].toFixed(0)}m`].last_speed
                                                     : stDict[`${CALC_DISTANCES_FIXED[1].toFixed(0)}m`].best_speed) : 0} 
                        time_diff={stDict_hasKey(stDict, `${CALC_DISTANCES_FIXED[1].toFixed(0)}m`) ? (
                        last_or_best_dist === "last" ? stDict[`${CALC_DISTANCES_FIXED[1].toFixed(0)}m`].last_time
                                                     : stDict[`${CALC_DISTANCES_FIXED[1].toFixed(0)}m`].best_time) : 0} 
                       top={row_tops[4]} left="40%" beforeText={'meters'}/>
    <Circle_Image_Pace renderBool={stDict !== undefined} 
                       speed_kmh={stDict_hasKey(stDict, `${CALC_DISTANCES_FIXED[2].toFixed(0)}m`) ? (
                        last_or_best_dist === "last" ? stDict[`${CALC_DISTANCES_FIXED[2].toFixed(0)}m`].last_speed
                                                     : stDict[`${CALC_DISTANCES_FIXED[2].toFixed(0)}m`].best_speed) : 0} 
                        time_diff={stDict_hasKey(stDict, `${CALC_DISTANCES_FIXED[2].toFixed(0)}m`) ? (
                        last_or_best_dist === "last" ? stDict[`${CALC_DISTANCES_FIXED[2].toFixed(0)}m`].last_time
                                                     : stDict[`${CALC_DISTANCES_FIXED[2].toFixed(0)}m`].best_time) : 0} 
                       top={row_tops[4]} left="75%" beforeText={'meters'}/>

    </View>
  );
};
