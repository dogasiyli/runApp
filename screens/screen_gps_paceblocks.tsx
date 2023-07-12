import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Image } from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { AreaButtonBackgroundProps, BT_SwitchingImages, BT_Toggle_Image, Circle_Text_Color } from '../functions/display/buttons';
import { Circle_Timer_Triangle, ControlSimulationMenu, ControlsSpeedScreen } from '../functions/display/buttons_special';
import { useAppState } from '../assets/stateContext';    
import { getFormattedDateTime } from '../asyncOperations/fileOperations';
import { PaceBlockDict } from '../assets/types';


interface PaceBlockScreenProps {
  insets: any;
}

export const PaceBlockScreen: React.FC<PaceBlockScreenProps> = ({ insets }) => {
    const { current_location, 
        activeTime, passiveTime, totalTime,
        bool_update_locations, enable_update_locations,
        runState, setRunState,
        arr_location_history, pos_array_diffs,
        simulationParams, setSimulationParams,
        paceBlock, setPaceBlock,
      } = useAppState();
     
      const [paceTextFast, setPaceTextFast] = React.useState(paceBlock.paceBlockTreshold_fast.pace.toFixed(1));
      const [paceTextSlow, setPaceTextSlow] = React.useState(paceBlock.paceBlockTreshold_slow.pace.toFixed(1));
      const [paceAimDistFast, setPaceAimDistFast] = React.useState(paceBlock.aim_dist["fast"].toString());
      const [paceAimTimeNotFast, setPaceAimTimeNotFast] = React.useState(paceBlock.aim_time["notfast"].toString());
      const [paceAimStarted, setPaceAimStarted] = React.useState(paceBlock.initial_index!=-1);

      const onChangePaceText = (newFast:string=null, newSlow:string=null) => {
        newFast==null ? setPaceTextFast(paceTextFast) : setPaceTextFast(newFast);
        newSlow==null ? setPaceTextSlow(paceTextSlow) : setPaceTextSlow(newSlow);
        setPaceBlock((prevPaceBlock:PaceBlockDict) => ({ 
            ...prevPaceBlock, 
            paceBlockTreshold_fast: {
              ...prevPaceBlock.paceBlockTreshold_fast,
              "pace": parseFloat(newFast==null ? paceTextFast : newFast), 
            },
            paceBlockTreshold_slow: {
              ...prevPaceBlock.paceBlockTreshold_slow,
              "pace": parseFloat(newSlow==null ? paceTextSlow : newSlow),
            },
          }));
      };

      const onChangePaceAim = (newPaceAimDistFast:string=null, newPaceAimTimeNotFast:string=null) => {
        newPaceAimDistFast==null ? setPaceAimDistFast(paceAimDistFast) : setPaceAimDistFast(newPaceAimDistFast);
        newPaceAimTimeNotFast==null ? setPaceAimTimeNotFast(paceAimTimeNotFast) : setPaceAimTimeNotFast(newPaceAimTimeNotFast);
        setPaceBlock((prevPaceBlock:PaceBlockDict) => ({
          ...prevPaceBlock,
          "aim_dist": {
            ...prevPaceBlock.aim_dist,
            "fast": parseFloat(newPaceAimDistFast==null ? paceAimDistFast : newPaceAimDistFast),
          },
          "aim_time": {
            ...prevPaceBlock.aim_time,
            "notfast": parseFloat(newPaceAimTimeNotFast==null ? paceAimTimeNotFast : newPaceAimTimeNotFast),
          },
        }));
      };

      useEffect(() => {
        console.log("PaceBlockScreen: useEffect: paceBlock: ", paceBlock);
        setPaceAimStarted(paceBlock.initial_index!=-1)
      }, [paceBlock]);

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

      {/*SET PACE BLOCKS*/}
      { !paceAimStarted && 
        (<View style={{flex:1, flexDirection:"row", width:"80%", position:"absolute", top:"5%", left:"10%",}}>
          <View style={{flex:1, flexDirection:"column", width:"35%", position:"absolute", top:"0%", left:"40%"}}>
            <Text style={{height: 40, width:"50%", margin: 6,borderWidth: 1,padding: 10,backgroundColor:"white"}}>Fast</Text>
            <TextInput
              style={{height: 40, width:"50%", margin: 6,borderWidth: 1,padding: 10,backgroundColor:"white"}}
              onChangeText={(newText) => onChangePaceText(newText, null)}
              value={paceTextFast}
              keyboardType="numeric"
            />
          </View>
          <View style={{flex:1, flexDirection:"column", width:"35%", position:"absolute", top:"0%", left:"60%"}}>
            <Text style={{height: 40, width:"50%", margin: 6,borderWidth: 1,padding: 10,backgroundColor:"white"}}>Slow</Text>
            <TextInput
              style={{height: 40, width:"50%", margin: 6,borderWidth: 1,padding: 10,backgroundColor:"white"}}
              onChangeText={(newText) => onChangePaceText(null, newText)}
              value={paceTextSlow}
              keyboardType="numeric"
            />
          </View>
        </View>
        )
      }
      {/*SET PACE BLOCK AIMS*/}
      { !paceAimStarted && 
        (
        <View style={{flex:1, flexDirection:"row", width:"80%", position:"absolute", top:"40%", left:"10%",}}>
          <View style={{flex:1, flexDirection:"column", width:"35%", position:"absolute", top:"0%", left:"40%"}}>
            <Text style={{height: 40, width:"50%", margin: 6,borderWidth: 1,padding: 10,backgroundColor:"white"}}>aimDistFast</Text>
            <TextInput
              style={{height: 40, width:"50%", margin: 6,borderWidth: 1,padding: 10,backgroundColor:"white"}}
              onChangeText={(newText) => onChangePaceAim(newText, null)}
              value={paceAimDistFast}
              keyboardType="numeric"
            />
          </View>
          <View style={{flex:1, flexDirection:"column", width:"35%", position:"absolute", top:"0%", left:"60%"}}>
            <Text style={{height: 40, width:"50%", margin: 6,borderWidth: 1,padding: 10,backgroundColor:"white"}}>aimTimeNFast</Text>
            <TextInput
              style={{height: 40, width:"50%", margin: 6,borderWidth: 1,padding: 10,backgroundColor:"white"}}
              onChangeText={(newText) => onChangePaceAim(null, newText)}
              value={paceAimTimeNotFast}
              keyboardType="numeric"
            />
          </View>
        </View>
        )
      }

      <BT_Toggle_Image renderBool={true} 
                     top="5%" left="75%" size={0.25}
                     bool_val={paceBlock.initial_index==-1} set_bool_val={null} 
                     toggle_val={pos_array_diffs.length}
                     toggle_func={(newVal:number) => setPaceBlock((prevParams) => ({ ...prevParams, initial_index: newVal }))} 
                     press_type="both"
                     belowText={paceBlock.initial_index==-1 ? 'Start' : 'Started'}
                     true_img='pause' false_img='run'/>
      
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
