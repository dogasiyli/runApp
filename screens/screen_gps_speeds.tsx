import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BT_Circle_Text_GPS, Circle_Text_Error, BT_Toggle_Image } from '../functions/display/buttons';
import { Circle_Image_Pace_v1, Circle_Timer_Triangle, Circle_Covered_Distance, Circle_Pace_Picked } from '../functions/display/buttons_special';
import { useAppState } from '../assets/stateContext';    
import { getFormattedDateTime } from '../asyncOperations/fileOperations';
import { CoveredDistance, SpeedTimeCalced_Dict, stDict_hasKey} from '../assets/types';
import { CALC_DISTANCES_FIXED, CALC_TIMES_FIXED } from '../assets/constants';

interface SpeedScreenProps {
  insets: any;
  stDict: SpeedTimeCalced_Dict;
  covered_dist: CoveredDistance;
}

export const SpeedScreen: React.FC<SpeedScreenProps> = ({ insets,stDict, covered_dist }) => {
    const row_tops = ["5%", "1%", "70%", "110%", "140%"];
    const { current_location, 
        activeTime, passiveTime, totalTime,
      } = useAppState();
    //const esa = [1001, 60*1000+1001, 10*60*1000+1001, 61*60*1000+1001,90*61*60*1000+1001];
    //const elapsedTime = esa[4];
    //const covered_dist_distance_last = 25000.001;
    //const covered_dist_distance_all = covered_dist_distance_last;

  // Use the state variables from the context as needed in this component
  const [bool_timeF_distT, set_bool_td] = useState(false);
  const [bool_lastF_bestT, set_bool_lb] = useState(false);
  const [dist_type_totalT_lastF, set_dist_type_totalT_lastF] = useState(true);
  const [pace_type_aveT_curF, set_pace_type_aveT_curF] = useState(true);

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
    <Circle_Timer_Triangle renderBool={true}
                           top={40} left={10}
                            activeTime={activeTime} passiveTime={passiveTime} totalTime={totalTime}
                            />
    <Circle_Covered_Distance renderBool={true} covered_dist={covered_dist}
                      dist_type_totalT_lastF={dist_type_totalT_lastF} set_dist_type={set_dist_type_totalT_lastF}
                      top="38%" left="45%"/>    

    <Circle_Pace_Picked renderBool={true}
                        covered_dist={covered_dist} stDict={stDict}
                        dist_type_totalT_lastF={dist_type_totalT_lastF}
                        activeTime={activeTime}
                        pace_type_aveT_curF={pace_type_aveT_curF} set_pace_type_aveT_curF={set_pace_type_aveT_curF}
                        top="27%" left="70%"/> 


    <BT_Toggle_Image renderBool={true} 
                     top={row_tops[2]} left="20%" size={0.25}
                     bool_val={bool_lastF_bestT} set_bool_val={set_bool_lb} 
                     true_img='best' false_img='last'/>
    <BT_Toggle_Image renderBool={true} 
                     top={row_tops[2]} left="60%" size={0.25}
                     bool_val={bool_timeF_distT} set_bool_val={set_bool_td} 
                     true_img='dist' false_img='time'/>


    {/*--------ROW 4----------*/}
    <Circle_Image_Pace_v1 renderBool={stDict !== undefined}
                      stDict={stDict} value={bool_timeF_distT ? CALC_DISTANCES_FIXED[0] : CALC_TIMES_FIXED[0]}
                      time_dist={bool_timeF_distT ? 'dist' : 'time'} last_or_best = {bool_lastF_bestT ? 'best' : 'last'}
                      top={row_tops[3]} left="5%" beforeText={bool_timeF_distT ? 'meters' : 'seconds'}/>
    <Circle_Image_Pace_v1 renderBool={stDict !== undefined}
                      stDict={stDict} value={bool_timeF_distT ? CALC_DISTANCES_FIXED[1] : CALC_TIMES_FIXED[1]}
                      time_dist={bool_timeF_distT ? 'dist' : 'time'} last_or_best = {bool_lastF_bestT ? 'best' : 'last'}
                      top={row_tops[3]} left="40%" beforeText={bool_timeF_distT ? 'meters' : 'seconds'}/>
    <Circle_Image_Pace_v1 renderBool={stDict !== undefined}
                          stDict={stDict} value={bool_timeF_distT ? CALC_DISTANCES_FIXED[2] : CALC_TIMES_FIXED[2]}
                          time_dist={bool_timeF_distT ? 'dist' : 'time'} last_or_best = {bool_lastF_bestT ? 'best' : 'last'}
                          top={row_tops[3]} left="75%" beforeText={bool_timeF_distT ? 'meters' : 'seconds'}/>


    </View>
  );
};
