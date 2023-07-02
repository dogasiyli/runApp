import React from 'react';
import { TouchableHighlight, View } from 'react-native';
import { CircleImagePaceV1Props, CircleTimerTriangleProps, CoveredDistanceProps, PickedPaceProps } from '../../assets/interface_definitions';
import { Circle_Image_Pace, Circle_Text_Color } from '../display/buttons';

import { stDict_hasKey } from '../../assets/types';
import { getReadableDuration } from '../../asyncOperations/fileOperations';
import { CALC_TIMES_FIXED } from '../../assets/constants';
import { calc_run_params } from '../../asyncOperations/utils';

const toggle = (setFunction) => setFunction(previousState => !previousState);  

export const Circle_Image_Pace_v1: React.FC<CircleImagePaceV1Props> = ({
  renderBool,
  stDict,
  value,
  time_dist,
  last_or_best,
  top, left,
  beforeText,
}) => {
    if (stDict === undefined)
        return;
    const c = time_dist==='time' ? 's' : 'm';
    const _key = value.toFixed(0) + c;
    const speed_kmh = stDict_hasKey(stDict, _key)
        ? last_or_best === 'last' ? stDict[_key].last_speed : stDict[_key].best_speed : 0;
    const time_diff = stDict_hasKey(stDict, _key)
        ? last_or_best === 'last' ? stDict[_key].last_time : stDict[_key].best_time : 0;

  return (
    <Circle_Image_Pace
      renderBool={renderBool || stDict !== undefined}
      speed_kmh={speed_kmh}
      time_diff={time_diff}
      top={top}
      left={left}
      beforeText={beforeText}
    />
  );
};

export const Circle_Timer_Triangle: React.FC<CircleTimerTriangleProps> = ({
    renderBool,
    totalTime,activeTime,passiveTime,
    top, left
  }) => {
    if (!renderBool)
        return;

    const floatVal = Math.max(totalTime,activeTime,passiveTime);
    let circleSize = floatVal;

    if ((circleSize==0 || circleSize>1000) && floatVal==circleSize)
    {
        //here circleSize is expected to be the time in miliseconds - hence:
        circleSize = 0.12;
        circleSize += floatVal>=60*1000 ? 0.01 : 0.0;//additional 0.01 for seconds to minutes
        circleSize += floatVal>=10*60*1000 ? 0.01 : 0.0;//additional 0.02 for more than 10 minutes
        circleSize += floatVal>=60*60*1000 ? 0.01 : 0.0;//additional 0.1 for minutes to hours
        circleSize += floatVal>=10*60*60*1000 ? 0.02 : 0.0;//additional 0.1 for more than 10hours
    }

    const top_tot_time = top - circleSize*45
    const left_tot_time = left - circleSize*50

    const top_act_time = top - circleSize*45
    const left_act_time = left + circleSize*50

    const top_pas_time = top + 1*circleSize*45
    const left_pas_time = left

    const circleW = circleSize; // Adjust the percentage as needed

    return (
        <>
            {/*total time*/}
            <Circle_Text_Color renderBool={true} 
                       dispVal={getReadableDuration(totalTime)}
                       circleSize={circleW}
                       backgroundColor="rgb(200,200,200)" 
                       top={top_tot_time.toFixed(2)+'%'} left={left_tot_time.toFixed(2)+'%'}
                       afterText='' beforeText=''/>
            {/*active time*/}
            <Circle_Text_Color renderBool={true}
                                dispVal={getReadableDuration(activeTime)}
                                circleSize={circleW}
                                backgroundColor="rgb(0,100,0)" 
                                top={`${top_act_time}%`} left={`${left_act_time}%`}
                                afterText='' beforeText=''/>
            {/*passive time*/}
            <Circle_Text_Color renderBool={true}
                                dispVal={getReadableDuration(passiveTime)}
                                circleSize={circleW}
                                backgroundColor="#505050" 
                                top={`${top_pas_time}%`} left={`${left_pas_time}%`}
                                afterText='' beforeText=''/>
        </>
    );
  };

export const Circle_Covered_Distance: React.FC<CoveredDistanceProps> = ({
    renderBool,
    covered_dist,
    dist_type_totalT_lastF, set_dist_type,
    top, left
  }) => {
    if (!renderBool)
        return;

    const covered_dist_use = dist_type_totalT_lastF ? covered_dist.distance_all : covered_dist.distance_last;
    const floatVal = dist_type_totalT_lastF ? 11 : 6;
    const bgc = dist_type_totalT_lastF ? "rgb(0,100,200)" : "rgb(0,100,100)";    

    const disp_val = covered_dist_use>10000 ? (covered_dist_use/1000).toFixed(2) + "km" : 
                     (covered_dist_use>1000 ? (covered_dist_use/1000).toFixed(2) + "km" : covered_dist_use.toFixed(0) + "m");

    const after_text = "";//dist_type_totalT_lastF ? "All" : "Last";

    return (
        <View style={{ flex: 1, position: 'absolute', marginTop: top, left: left, justifyContent: 'flex-start', alignItems: 'center' }}>
            <TouchableHighlight underlayColor="white" style={{ padding: 10 }} 
                          onPress={() => toggle(set_dist_type)}>
                <Circle_Text_Color renderBool={true} 
                            dispVal={disp_val}
                            floatVal={floatVal}
                            circleSize={0.14 + 0.015*Math.floor(Math.log10(covered_dist_use+0.001))}
                            backgroundColor={bgc} top={0} left={0}
                            afterText={after_text} beforeText=''/>
            </TouchableHighlight>
        </View>
    );
};

export const Circle_Pace_Picked: React.FC<PickedPaceProps> = ({
    renderBool,
    covered_dist, stDict,
    dist_type_totalT_lastF,
    activeTime, 
    pace_type_aveT_curF, set_pace_type_aveT_curF,
    top, left
  }) => {
    if (!renderBool)
        return;

    //console.log("Circle_Pace_Picked: ", pace_type_aveT_curF, top, left);
 
    // show the pace for the whole run or the last part

    const covered_dist_use = dist_type_totalT_lastF ? covered_dist.distance_all : covered_dist.distance_last;
    const covered_dist_time = 0.001 + (dist_type_totalT_lastF ? activeTime : covered_dist.time_diff_last); 
    const [pace, kmh] = calc_run_params(covered_dist_use, covered_dist_time, false);
    //console.log("Circle_Pace_Picked: ", pace, kmh, covered_dist_use, covered_dist_time)
    //calculate pace using activeTime and covered_dist_use
        
    // show the pace for last 30 seconds
    if (pace_type_aveT_curF) 
        return (
            
            <View style={{ flex: 1, position: 'absolute', marginTop: top, left: left, justifyContent: 'flex-start', alignItems: 'center' }}>
            
            <TouchableHighlight underlayColor="pink" style={{ padding: 10 }} 
                          onLongPress={() => toggle(set_pace_type_aveT_curF)}>
            
            <Circle_Image_Pace_v1 
                renderBool={stDict !== undefined}
                stDict={stDict} value={CALC_TIMES_FIXED[1]}
                time_dist={'time'} last_or_best = {'last'}
                top={"0%"} left={"0%"} beforeText={'seconds'}/>
            </TouchableHighlight>
            </View>
        )
    else
     return(
        <View style={{ flex: 1, position: 'absolute', marginTop: top, left: left, justifyContent: 'flex-start', alignItems: 'center' }}>
        <TouchableHighlight underlayColor="pink" style={{ padding: 10 }} 
                      onLongPress={() => toggle(set_pace_type_aveT_curF)}>
            <Circle_Image_Pace
                renderBool={renderBool || stDict !== undefined}
                speed_kmh={kmh}
                time_diff={covered_dist_time}
                top={"0%"}
                left={"0%"}
                beforeText={"meters"}
            />
        </TouchableHighlight>
        </View>
    );
};

