import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import { CircleImagePaceV1Props, CircleTimerTriangleProps, CoveredDistanceProps, PickedPaceProps } from '../../assets/interface_definitions';
import { Circle_Image_Pace, Circle_Text_Color, BT_Toggle_Image, BT_Picker, BT_Functional_Image } from '../display/buttons';

import { PaceBlockEntry, SimulationDict, stDict_hasKey } from '../../assets/types';
import { getReadableDuration, saveToFile_multiple } from '../../asyncOperations/fileOperations';
import { CALC_TIMES_FIXED } from '../../assets/constants';
import { calc_run_params } from '../../asyncOperations/utils';

const toggle = (setFunction) => setFunction((previousState:boolean) => !previousState);  

export const Circle_Image_Pace_v1: React.FC<CircleImagePaceV1Props> = ({
  renderBool,
  stDict,
  value,
  time_dist,
  last_or_best,
  top, left,
  beforeText,
  size,
}) => {
    if (stDict === undefined)
        return;
    const c = time_dist==='time' ? 's' : 'm';
    const _key = value.toFixed(0) + c;
    const speed_kmh = stDict_hasKey(stDict, _key)
        ? last_or_best === 'last' ? stDict[_key].last_speed : stDict[_key].best_speed : 0;
    const time_diff = stDict_hasKey(stDict, _key)
        ? last_or_best === 'last' ? stDict[_key].last_time : stDict[_key].best_time : 0;

    if (speed_kmh==0)
        return;

  return (
    <Circle_Image_Pace
      renderBool={renderBool || stDict !== undefined}
      speed_kmh={speed_kmh}
      time_diff={time_diff}
      top={top}
      left={left}
      beforeText={beforeText}
      size={size}
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
                                textColor='white'
                                top={`${top_act_time}%`} left={`${left_act_time}%`}
                                afterText='' beforeText=''/>
            {/*passive time*/}
            <Circle_Text_Color renderBool={true}
                                dispVal={getReadableDuration(passiveTime)}
                                circleSize={circleW}
                                backgroundColor="#505050" 
                                textColor='white'
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

    const after_text = dist_type_totalT_lastF ? "Total Dist." : "Last Dist.";

    return (
        <View style={{ flex: 1, position: 'absolute', top: top, left: left, 
                        justifyContent: 'flex-start', alignItems: 'center',
                        alignContent:'center', alignSelf:'center' }}>
            <TouchableHighlight underlayColor="transparent" style={{ padding: 35 }} 
                          onPress={() => toggle(set_dist_type)}>
                <Circle_Text_Color renderBool={true} 
                            dispVal={disp_val}
                            floatVal={floatVal}
                            circleSize={0.14 + 0.015*Math.floor(Math.log10(covered_dist_use+0.001))}
                            backgroundColor={bgc} top={0} left={0}
                            textColor='white'
                            afterText='' beforeText=''/>
            </TouchableHighlight>
            <Text style={{color:'white'}}>{after_text}</Text>
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
    const covered_dist_time = 0.001 + (dist_type_totalT_lastF ? activeTime/1000 : covered_dist.time_diff_last); 
    const [pace, kmh] = calc_run_params(covered_dist_use, covered_dist_time, false);
    const picked_pace_exp = pace_type_aveT_curF ? "Current" : (dist_type_totalT_lastF ? "Avg.All" : "Avg.Last")
    //console.log("Circle_Pace_Picked: ", pace, kmh, "d:",covered_dist_use, "t:",covered_dist_time,picked_pace_exp)
    //calculate pace using activeTime and covered_dist_use
        
    // show the pace for last 30 seconds
    if (pace_type_aveT_curF) 
        return (
            
            <View style={{ flex: 1, position: 'absolute', marginTop: top, left: left, justifyContent: 'flex-start', alignItems: 'center' }}>
            
            <TouchableHighlight underlayColor="transparent" style={{ padding: 50 }} 
                          onPress={() => toggle(set_pace_type_aveT_curF)}>
            
            <Circle_Image_Pace_v1 
                renderBool={stDict !== undefined}
                stDict={stDict} value={CALC_TIMES_FIXED[1]}
                time_dist={'time'} last_or_best = {'last'}
                top={"0%"} left={"0%"} beforeText={'seconds'}/>
            </TouchableHighlight>
            <Text style={{marginTop:"0%", color:"#ffffff"}}>{picked_pace_exp}</Text>
            </View>
        )
    else
     return(
        <View style={{ flex: 1, position: 'absolute', marginTop: top, left: left, justifyContent: 'flex-start', alignItems: 'center' }}>
        <TouchableHighlight underlayColor="transparent" style={{ padding: 50 }} 
                      onPress={() => toggle(set_pace_type_aveT_curF)}>
            <Circle_Image_Pace
                renderBool={renderBool || stDict !== undefined}
                speed_kmh={kmh}
                time_diff={covered_dist_time}
                top={"0%"}
                left={"0%"}
                beforeText={"meters"}
            />
        </TouchableHighlight>
        <Text style={{marginTop:"0%", color:"#ffffff"}}>{picked_pace_exp}</Text>
        </View>
    );
};

interface ControlsSpeedScreenProps {
    renderBool: boolean;
    bool_update_locations:boolean;
    enable_update_locations: React.Dispatch<React.SetStateAction<boolean>>;
    arr_location_history, pos_array_diffs,
    current_location: object;
    runState: string;
    setRunState: React.Dispatch<React.SetStateAction<string>>;
    top: number;
};
export const ControlsSpeedScreen: React.FC<ControlsSpeedScreenProps> = ({
    renderBool,
    bool_update_locations, enable_update_locations,
    arr_location_history, pos_array_diffs,
    current_location, 
    runState, setRunState,
    top,
  }) => {
    if (!renderBool)
        return;

    const sizes = [0.15, 0.20, 0.25];
    const lefts = [3, 35, 70];
    const top_adds=[7, 4, 0];
    const left_adds=[7, 4, 0];
    const pick_size = 0;
    const pick_left = 0;

    //console.log("current_location:", current_location)

    const leftD = {"gps":2,"camera":0,"save":0,"run":1,"finish":2,"share":2,"stats":1,};
    const sizeD = {"gps":1,"camera":runState === "stopped" ? 2: 1,"save":2,"run":2,"finish":1,"share":1,"stats":1,};

    const gps_color = bool_update_locations ? (current_location["coords"]["accuracy"]>10 ? "orange" : "cyan") : "red";
    const run_color = (runState === "initial" || runState === "paused") ? "cyan" : (runState === "running" ? "yellow" : "pink");
    const run_below_text = runState === "paused" ? "GO ON" : (runState === "running" ? "REST" : undefined);


    const underlayColor = {"gps":gps_color,
                           "camera":"transparent",
                           "run":run_color,
                           "save":"red",
                           "finish":"red",
                           "share":"transparent",
                           "stats":"transparent",};
    
    const new_run_state = (runState === "initial" || runState === "paused") ? "running" : (runState === "running" ? "paused" : runState);

    const last_item = (runState === "initial" || runState === "running") ? "gps" : (runState === "paused" ? "finish" : "share");
    const gps_image = bool_update_locations ? "gps" : "no-gps";

    //console.log("last_item:",last_item)
    if (runState=="initial" || runState=="running" || runState=="paused")
        return (
            <>
            <BT_Toggle_Image renderBool={true} 
                top={(top+top_adds[sizeD["camera"]]).toFixed(1)+'%'} 
                left={(lefts[leftD["camera"]]+left_adds[sizeD["camera"]]).toFixed(1)+'%'} 
                size={sizes[sizeD["camera"]]}
                bool_val={true} set_bool_val={undefined} underlayColor={underlayColor["camera"]}
                true_img='camera' false_img='camera' press_type="none"/>
            <BT_Toggle_Image renderBool={true} 
                top={(top+top_adds[sizeD["run"]]).toFixed(1)+'%'} 
                left={(lefts[leftD["run"]]+left_adds[sizeD["run"]]).toFixed(1)+'%'} 
                size={sizes[sizeD["run"]]}
                bool_val={runState=="initial" || runState=="paused"} set_bool_val={undefined}  underlayColor={underlayColor["run"]}
                toggle_func={setRunState} toggle_val={new_run_state}
                belowText={run_below_text}
                true_img='run' false_img='pause' press_type="short"/>
            <BT_Toggle_Image renderBool={true} 
                top={(top+top_adds[sizeD[last_item]]).toFixed(1)+'%'} 
                left={(lefts[leftD[last_item]]+left_adds[sizeD[last_item]]).toFixed(1)+'%'} 
                size={sizes[sizeD[last_item]]}

                bool_val={runState=="paused" ? true : bool_update_locations} 
                set_bool_val={runState=="paused" ? undefined : enable_update_locations} 

                toggle_func={runState=="paused" ? setRunState : undefined} 
                toggle_val={runState=="paused" ? "finish" : undefined}

                underlayColor={underlayColor[last_item]}
                true_img={runState=="paused" ? 'finish' : gps_image} false_img={runState=="paused" ? 'finish' : gps_image} 
                press_type="short"/>
            </>
        );
    if (runState=="finish")
        return (
            <>
            <BT_Functional_Image renderBool={true} 
                top={(top+top_adds[sizeD["save"]]).toFixed(1)+'%'} 
                left={(lefts[leftD["save"]]+left_adds[sizeD["save"]]).toFixed(1)+'%'} 
                size={sizes[sizeD["save"]]}
                underlayColor={underlayColor["save"]}
                img_src='save' press_type="both"
                func={saveToFile_multiple} params={[arr_location_history, pos_array_diffs]}/>
            <BT_Toggle_Image renderBool={true} 
                top={(top+top_adds[sizeD["stats"]]).toFixed(1)+'%'} 
                left={(lefts[leftD["stats"]]+left_adds[sizeD["stats"]]).toFixed(1)+'%'} 
                size={sizes[sizeD["stats"]]}
                bool_val={true} set_bool_val={undefined}  underlayColor={underlayColor["stats"]}
                true_img='stats' false_img='stats' press_type="none"/>
            <BT_Toggle_Image renderBool={true} 
                top={(top+top_adds[sizeD[last_item]]).toFixed(1)+'%'} 
                left={(lefts[leftD[last_item]]+left_adds[sizeD[last_item]]).toFixed(1)+'%'} 
                size={sizes[sizeD[last_item]]}
                bool_val={true} set_bool_val={undefined}
                underlayColor={underlayColor[last_item]}
                true_img={last_item} false_img={last_item} press_type="none"/>
            </>
        );
  }

  interface ControlSimulationProps {
    renderBool: boolean;
    top:string; 
    left:string;
    simParams: SimulationDict;
    setSimParams:React.Dispatch<React.SetStateAction<SimulationDict>>;
  }
export const ControlSimulationMenu: React.FC<ControlSimulationProps> = ({ 
  renderBool, 
  top, left, 
  simParams, 
  setSimParams,
  }) => {
  if (!renderBool) {
    return null;
  }
  const simToChoose = ['circleRun', 'walk01', 'BFFast', 'BFWarm', 'garminpace13'];
  const simStepToChoose = [250, 500, 750, 1000, 2000, 3000, 5000, 10000]
  return (  
    <>
        <BT_Picker renderBool={simParams.isPaused }
               pickableBool = {simParams.index == -1 }
               top={top} left="0%" width="35%"
               items={simToChoose} 
               value={simParams.selected} 
               setValue={(newVal:string) => setSimParams(prevParams => ({
                ...prevParams, selected:newVal}))}
               belowText={`Len(${simParams.gpsDataArray.length})`}
        />
        <BT_Picker renderBool={true}
                pickableBool = {simParams.isPaused}
                top={top} left={simParams.index == -1 ? "63%" : "63%"} width="35%"
                items={simStepToChoose} value={simParams.stepSelected} 
                setValue={(newVal:number) => setSimParams(prevParams => ({
                    ...prevParams, stepSelected:newVal}))}                
                itemLabelsAddLast='ms' fontSize={12}
                belowText='Steps'
        />
        <BT_Toggle_Image renderBool={true} 
                        top={top} left="40%" size={0.20}
                        bool_val={simParams.isPaused}
                        set_bool_val={(newVal:boolean) => setSimParams((prevParams) => ({ ...prevParams, isPaused: newVal }))}
                        toggle_val={!simParams.isPaused}
                        toggle_func={(newVal:boolean) => setSimParams((prevParams) => ({ ...prevParams, isPaused: newVal }))}                      
                        press_type="both"
                        true_img='simulate' false_img='wait'/>
        </>
  );
};


export interface IntervalRowProps {
    renderBool: boolean;
    intervalRow:PaceBlockEntry,
    time_dist:string,
    top: number;
    last_idx:number;
    cur_idx:number;
    beforeText?: string;
    size?:number;
  }

export const IntervalRow: React.FC<IntervalRowProps> = ({
    renderBool,
    intervalRow,
    time_dist,
    top,
    beforeText,
    last_idx, cur_idx,
    size=null,
  }) => {

      if (!renderBool)
          return;

      const pace_size = size===null? 0.13 : size;
      const time_size = size===null? (cur_idx==last_idx ? 0.23: 0.20) : size;
      const {block_type, dist, init, last, pace, time} = intervalRow;
      const val_str = time_dist==='time' ? time.toFixed(0)+'s' : dist.toFixed(0)+'m';
      const [_, speed_kmh] = calc_run_params(dist, time);
      const new_top = (top + (cur_idx-last_idx)*25).toFixed(0)+'%';
      const new_top2 = (top +  (cur_idx==last_idx ? 0 : 3) + (cur_idx-last_idx)*25).toFixed(0)+'%';
      const afterText= cur_idx.toFixed(0)+'/'+last_idx.toFixed(0)

      //console.log("interval row ", last_idx, cur_idx, intervalRow)
      
      if (speed_kmh==0)
          return;
  
    return (
    <>
      <Circle_Image_Pace
        renderBool={renderBool}
        speed_kmh={speed_kmh}
        time_diff={time}
        top={new_top}
        left={"70%"}
        beforeText={beforeText}
        size={pace_size}
      />
      <Circle_Text_Color 
        renderBool={true} 
        dispVal={dist.toFixed(0)+'m'}
        circleSize={time_size}
        backgroundColor= { cur_idx!=last_idx ? "rgb(50,50,50)" :  "rgb(50,200,200)"} 
        textColor= { cur_idx!=last_idx ? "rgb(255,255,255)" :  "rgb(0,0,0)"} 
        top={new_top2}
        left={'40%'}
        afterText={ cur_idx==last_idx ? "DIST" :  ""} 
        beforeText=''
      />     
       <Circle_Text_Color 
      renderBool={true} 
      dispVal={getReadableDuration(time*1000)}
      circleSize={time_size}
      backgroundColor= { cur_idx!=last_idx ? "rgb(50,50,50)" :  "rgb(50,200,200)"} 
      textColor= { cur_idx!=last_idx ? "rgb(255,255,255)" :  "rgb(0,0,0)"} 
      top={new_top2}
      left={'10%'}
      afterText={ cur_idx==last_idx ? "TIME" :  ""} 
      beforeText=''
    />
      </>
    );
  };