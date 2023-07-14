import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Circle_Text_Color } from '../functions/display/buttons';
import { Circle_Timer_Triangle, ControlSimulationMenu } from '../functions/display/buttons_special';
import { useAppState } from '../assets/stateContext';    
import { getFormattedDateTime } from '../asyncOperations/fileOperations';

interface SimulateScreenProps {
  insets: any;
}

export const SimulateScreen: React.FC<SimulateScreenProps> = ({ insets }) => {
    //const [initTimestamp, setInitTimestamp] = useState(0);

    const { 
        simulationParams, setSimulationParams,
        activeTime, passiveTime, totalTime,
    } = useAppState();

  return (
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "#a7f" }}>
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


    <ControlSimulationMenu renderBool={true}
                            top="30%" left="0%"
                            simParams={simulationParams}
                            setSimParams={setSimulationParams}
    />

    </View>
  );
};
