import { INIT_POSITION, INIT_SIMULATION_PARAMS, TIME_STAMPS } from "../assets/constants";
import { IMapData } from "../assets/interface_definitions";
import { GPS_Data, SimulationDict } from "../assets/types";

export const resetSimulation = async (
    setSimParams: React.Dispatch<React.SetStateAction<SimulationDict>>,
    set_current_location: React.Dispatch<React.SetStateAction<GPS_Data>>,
    set_location_history: React.Dispatch<React.SetStateAction<Array<object>>>,

    set_pos_array_kalman: React.Dispatch<React.SetStateAction<Array<object>>>,
    set_pos_array_diffs: React.Dispatch<React.SetStateAction<Array<object>>>,
    set_pos_array_timestamps: React.Dispatch<React.SetStateAction<object>>,

    setActiveTime: React.Dispatch<React.SetStateAction<number>>,
    setPassiveTime: React.Dispatch<React.SetStateAction<number>>,
    setTotalTime: React.Dispatch<React.SetStateAction<number>>,

    setLastTimestamp: React.Dispatch<React.SetStateAction<number>>,
    setInitTimestamp: React.Dispatch<React.SetStateAction<number>>,

    setRunState: React.Dispatch<React.SetStateAction<string>>,
    setMapData: React.Dispatch<React.SetStateAction<IMapData>>,
  ) => {
    setSimParams(INIT_SIMULATION_PARAMS);
    set_current_location(INIT_POSITION);
    set_location_history(new Array(INIT_POSITION));

    set_pos_array_kalman([]);
    set_pos_array_diffs([]);
    set_pos_array_timestamps(TIME_STAMPS);

    setActiveTime(0);
    setPassiveTime(0);
    setTotalTime(0);

    setInitTimestamp(null);
    setLastTimestamp(null);

    setRunState('initial');
    setMapData((prevParams) => ({ ...prevParams, locations: [] }));
  };