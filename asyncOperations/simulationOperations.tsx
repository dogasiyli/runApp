
const sims_all =
{
  'circleRun': require('../assets/plottable_run_examples/runPositions_20230526_123109_circleRun.json'),
  'walk01': require('../assets/plottable_run_examples/runPositions_20230702_092833_walk01.json'),
  'BFFast': require('../assets/plottable_run_examples/runPositions_20230705_204451_BFFast.json'),
  'BFWarm': require('../assets/plottable_run_examples/runPositions_20230705_202354_BFWarm.json'),
  'garminpace13': require('../assets/plottable_run_examples/runPositions_20230525_062510_garminpace13.json'),
  'intervalBF': require('../assets/plottable_run_examples/runPositions_20230712_204346_intervalBF.json'),
  'gamzeHO': require('../assets/plottable_run_examples/runPositions_20230713_063447_gamzeHaciOsman.json'),
}

export const loadSimulationData = async (simulationParams, setSimulationParams) => {
    //console.log("selectedSimulation changed to(", simulationParams.selected, "), simulationParams.index(", simulationParams.index ,")")                 
      if (simulationParams.index=== -1) {
        console.log("Loading simulation data:", simulationParams.selected);
        // Parse the JSON data from the file
        let parsedData = sims_all[simulationParams.selected];
        console.log("Loaded simulation data. Type:", typeof parsedData);
        console.log("Length of positions:", parsedData.length);
        if (parsedData[0]["timestamp"] !== undefined && parsedData[0]["timestamp"] !== 0) {
          parsedData = parsedData.slice(1, parsedData.length)
          console.log("Removed first element of positions:", parsedData.length);
        }
        setSimulationParams((prevParams) => ({
          ...prevParams,
          gpsDataArray: parsedData,
        }));
    }
  };

  const startSim = (simulationParams, setSimulationParams, set_current_location) => {
    console.log("0.started simulation adding first gps data array with set_current_location");
    setSimulationParams((prevParams) => ({
      ...prevParams,
      timestampOffset: 0,
    }));
    set_current_location(simulationParams.gpsDataArray[0]); 
    console.log("simulationParams.gpsDataArray[0]:\n", simulationParams.gpsDataArray[0]);   
  }
  const endSim = (simulationParams, setSimulationParams) => {
    console.log("endSim: simulationParams.isPaused:", simulationParams.isPaused);
    clearInterval(simulationParams.interval);
    setSimulationParams((prevParams) => ({
      ...prevParams,
      interval: null,
      isPaused: true,
    }));
  }
  const enableSimulation = (initIndex: number, simulationParams, setSimulationParams, set_current_location) => {
    let currentIndex = initIndex;
    console.log("??????????????startSimulation: currentIndex:", currentIndex);
  
    // Clear the previous interval if it exists
    if (simulationParams.interval) {
      clearInterval(simulationParams.interval);
    }
  
    // Update current location at a fixed interval (X seconds in this case)
    const interval = setInterval(() => {
      const prevIndex = currentIndex - 1;
  
      if (currentIndex === 0) {
        startSim(simulationParams, setSimulationParams, set_current_location);
        currentIndex = 1;
      } else if (
        currentIndex === simulationParams.gpsDataArray.length ||
        simulationParams.isPaused
      ) {
        // Reached the end of the array or paused, stop the simulation
        endSim(simulationParams, setSimulationParams);
        return;
      } else {
        const difTimeStep =
          simulationParams.gpsDataArray[currentIndex].timestamp -
          simulationParams.gpsDataArray[prevIndex].timestamp;
  
        set_current_location(simulationParams.gpsDataArray[currentIndex]);
        currentIndex = currentIndex + 1;
        setSimulationParams((prevParams) => ({
          ...prevParams,
          index: currentIndex - 1,
          timestampOffset: prevParams.timestampOffset + difTimeStep,
          interval: interval,
        }));
      }
    }, simulationParams.stepSelected);
  
    // Store the interval reference
    setSimulationParams((prevParams) => ({
      ...prevParams,
      interval: interval,
    }));
  };

export const startStopSimulation = async (simulationParams, setSimulationParams, set_current_location) => {
    //console.log("++++++++++++++++simulationParams.isPaused:", simulationParams.isPaused);
    //console.log("++++++++++++++++simulationParams.timestampOffset:", simulationParams.timestampOffset);
    if (!simulationParams.isPaused) {
        // Resume the simulation
        enableSimulation(simulationParams.index+1, simulationParams, setSimulationParams, set_current_location);
    } 
    //else if (!simulationParams.isPaused && simulationParams.timestampOffset>0) {console.log(":::::::::::::::JUST PAGE IS REOPENED-simulationParams.timestampOffset:", simulationParams.timestampOffset);}
    else {
        // Pause the simulation
        //console.log("pauseSimUseEffect:", simulationParams.isPaused);
        clearInterval(simulationParams.interval);
        setSimulationParams((prevParams) => ({
          ...prevParams,
          interval: null,
        }));
    } 
}
