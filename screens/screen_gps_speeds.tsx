import React, { useState } from 'react';
import { View, Text, DimensionValue } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BT_Toggle_Image } from '../functions/display/buttons';
import { Circle_Image_Pace_v1, Circle_Timer_Triangle, Circle_Covered_Distance, 
         Circle_Pace_Picked, ControlsSpeedScreen, ControlSimulationMenu } from '../functions/display/buttons_special';
import { useAppState } from '../assets/stateContext';    
import { CALC_DISTANCES_FIXED, CALC_TIMES_FIXED } from '../assets/constants';

interface SpeedScreenProps {
  insets: any;
}

export const SpeedScreen: React.FC<SpeedScreenProps> = ({ insets }) => {
    const row_tops:DimensionValue[] = ["30%", "90%"];
    const pace_size = 0.13;
    const { current_location, 
        activeTime, passiveTime, totalTime,
        bool_update_locations, enable_update_locations,
        arr_location_history, pos_array_diffs,
        simulationParams, setSimulationParams,    
        runState, setRunState,
        stDict, coveredDistance,
        dist_type_totalT_lastF, set_dist_type_totalT_lastF,
        pace_type_aveT_curF, set_pace_type_aveT_curF,
      } = useAppState();
    //const esa = [1001, 60*1000+1001, 10*60*1000+1001, 61*60*1000+1001,90*61*60*1000+1001];
    //const elapsedTime = esa[4];
    //const covered_dist_distance_last = 25000.001;
    //const covered_dist_distance_all = covered_dist_distance_last;

  // Use the state variables from the context as needed in this component
  const [bool_timeF_distT, set_bool_td] = useState(false);
  const [bool_lastF_bestT, set_bool_lb] = useState(false);

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "#a7f" }}>
    <StatusBar style="auto" />
                
    {/*--------ROW 0-COL 2/3----------*/}
    <Circle_Timer_Triangle renderBool={true}
                           top={10} left={10}
                            activeTime={activeTime} passiveTime={passiveTime} totalTime={totalTime}
                            />
    <Circle_Covered_Distance renderBool={true} covered_dist={coveredDistance}
                      dist_type_totalT_lastF={dist_type_totalT_lastF} set_dist_type={set_dist_type_totalT_lastF}
                      top="3%" left="40%"/>    

    <Circle_Pace_Picked renderBool={true}
                        covered_dist={coveredDistance} stDict={stDict}
                        dist_type_totalT_lastF={dist_type_totalT_lastF}
                        activeTime={activeTime}
                        pace_type_aveT_curF={pace_type_aveT_curF} set_pace_type_aveT_curF={set_pace_type_aveT_curF}
                        top="6%" left="65%"/> 


    <BT_Toggle_Image renderBool={true} 
                     top={row_tops[0]} left="30%" size={0.20}
                     bool_val={bool_lastF_bestT} set_bool_val={set_bool_lb} 
                     press_type="both"
                     true_img='best' false_img='last'/>
    <BT_Toggle_Image renderBool={true} 
                     top={row_tops[0]} left="50%" size={0.20}
                     press_type="both"
                     bool_val={bool_timeF_distT} set_bool_val={set_bool_td} 
                     true_img='dist' false_img='time'/>


    {/*--------ROW 4----------*/}
    <Circle_Image_Pace_v1 renderBool={stDict !== undefined}
                      stDict={stDict} value={bool_timeF_distT ? CALC_DISTANCES_FIXED[0] : CALC_TIMES_FIXED[0]}
                      time_dist={bool_timeF_distT ? 'dist' : 'time'} last_or_best = {bool_lastF_bestT ? 'best' : 'last'}
                      top={row_tops[1]} left="5%" beforeText={bool_timeF_distT ? 'meters' : 'seconds'}
                      size={pace_size}/>
    <Circle_Image_Pace_v1 renderBool={stDict !== undefined}
                      stDict={stDict} value={bool_timeF_distT ? CALC_DISTANCES_FIXED[1] : CALC_TIMES_FIXED[1]}
                      time_dist={bool_timeF_distT ? 'dist' : 'time'} last_or_best = {bool_lastF_bestT ? 'best' : 'last'}
                      top={row_tops[1]} left="40%" beforeText={bool_timeF_distT ? 'meters' : 'seconds'}
                      size={pace_size}/>
    <Circle_Image_Pace_v1 renderBool={stDict !== undefined}
                          stDict={stDict} value={bool_timeF_distT ? CALC_DISTANCES_FIXED[2] : CALC_TIMES_FIXED[2]}
                          time_dist={bool_timeF_distT ? 'dist' : 'time'} last_or_best = {bool_lastF_bestT ? 'best' : 'last'}
                          top={row_tops[1]} left="75%" beforeText={bool_timeF_distT ? 'meters' : 'seconds'}
                          size={pace_size}/>

    {simulationParams.index==-1 ?

    <ControlsSpeedScreen renderBool={true} 
                         bool_update_locations={bool_update_locations} enable_update_locations={enable_update_locations}
                         arr_location_history={arr_location_history} pos_array_diffs={pos_array_diffs}
                         runState={runState} setRunState={setRunState} current_location={current_location}
                         top={80}
    />
    :
      <ControlSimulationMenu renderBool={true}
          top="80%" left="0%"
          simParams={simulationParams} setSimParams={setSimulationParams}
      />
    }


    </View>
  );
};
