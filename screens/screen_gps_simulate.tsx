import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BT_Toggle_Image, Circle_Text_Color } from '../functions/display/buttons';
import { Circle_Timer_Triangle, ControlsSpeedScreen } from '../functions/display/buttons_special';
import { useAppState } from '../assets/stateContext';    
import { getFormattedDateTime } from '../asyncOperations/fileOperations';


interface SimulateScreenProps {
  insets: any;
}

export const SimulateScreen: React.FC<SimulateScreenProps> = ({ insets }) => {
    const simulation_step_msec = 2000;
    const [initTimestamp, setInitTimestamp] = useState(0);
    const { current_location, set_current_location,
        simulationTimestampOffset, setSimulationTimestampOffset,
        simulationInterval, setSimulationInterval,
        simulationGpsDataArray, setSimulationGpsDataArray,
        simulationIsPaused, setSimulationIsPaused,
        activeTime, passiveTime, totalTime,
        bool_update_locations, enable_update_locations,
        runState, setRunState,
      } = useAppState();

    useEffect(() => {
        if (simulationGpsDataArray.length === 0) {
            console.log("Loading simulation data...");
            // Parse the JSON data from the file
            let parsedData = require('../assets/plottable_run_examples/runPositions_20230702_092833_1.json');
            console.log("Loaded simulation data. Type:", typeof parsedData);
            console.log("Length of positions:", parsedData.length);
            if (parsedData[0]["timestamp"] !== undefined && parsedData[0]["timestamp"] !== 0) {
              parsedData = parsedData.slice(1, parsedData.length)
              console.log("Removed first element of positions:", parsedData.length);
            }
            setInitTimestamp(parsedData[0]["timestamp"]);
            setSimulationGpsDataArray(parsedData);
        }
      }, []);


      useEffect(() => {
        console.log("++++++++++++++++simulationIsPaused:", simulationIsPaused);
        console.log("++++++++++++++++simulationTimestampOffset:", simulationTimestampOffset);
        if (!simulationIsPaused && simulationTimestampOffset<=0) {
            // Resume the simulation
            const currentTimestamp = Date.now();
            const timeDifference = currentTimestamp - initTimestamp - simulationTimestampOffset;
            console.log("timeDifference:", timeDifference);
            startSimulation(timeDifference);
        } 
        else if (!simulationIsPaused && simulationTimestampOffset>0) {
          console.log(":::::::::::::::JUST PAGE IS REOPENED-simulationTimestampOffset:", simulationTimestampOffset);
        }
        else {
            // Pause the simulation
            clearInterval(simulationInterval);
            setSimulationInterval(null);
        }
      }, [simulationIsPaused]);


    const startSimulation = (timeDifference) => {
        let currentIndex = Math.floor(simulationTimestampOffset / simulation_step_msec);
        console.log("startSimulation: currentIndex:", currentIndex);
    
        // Update current location at a fixed interval (X seconds in this case)
        const interval = setInterval(() => {
          const newIndex = currentIndex + 1;
          console.log("startSimulation: newIndex:", newIndex, simulationGpsDataArray.length);
    
          if (newIndex >= simulationGpsDataArray.length) {
            // Reached the end of the array, stop the simulation
            clearInterval(interval);
            setSimulationInterval(null);
            setSimulationIsPaused(true);
            return;
          }
    
          const nextTimestamp = initTimestamp + timeDifference + (newIndex * simulation_step_msec);
          const nextLocation = { ...simulationGpsDataArray[newIndex], timestamp: nextTimestamp };
          set_current_location(nextLocation);
          currentIndex = newIndex;
          setSimulationTimestampOffset((prevOffSet) => prevOffSet + simulation_step_msec);
        }, simulation_step_msec);
    
        // Store the interval reference to clear it later if needed
        setSimulationInterval(interval);
      };


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
  

    <BT_Toggle_Image renderBool={true} 
                     top="50%" left="40%" size={0.20}
                     bool_val={simulationIsPaused} set_bool_val={setSimulationIsPaused} 
                     press_type="both"
                     true_img='simulate' false_img='wait'/>


    <ControlsSpeedScreen renderBool={true} 
                         bool_update_locations={bool_update_locations} enable_update_locations={enable_update_locations}
                         runState={runState} setRunState={setRunState} current_location={current_location}
                         top={145}/>

    </View>
  );
};
