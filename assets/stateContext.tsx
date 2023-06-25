import React, { createContext, useContext, useState } from 'react';
import { INIT_PERMITS, INIT_POSITION } from '../assets/constants';
import { PositionDict } from './types';

export interface MoveableImageDict
{
  positionX: number;
  positionY: number;
  selected: boolean;
}
interface StateContextType {
    permits:object;
    set_permits: React.Dispatch<React.SetStateAction<object>>;

    current_location: object;
    set_current_location: React.Dispatch<React.SetStateAction<object>>;

    bool_record_locations:boolean;
    enable_record_locations: React.Dispatch<React.SetStateAction<boolean>>;

    bool_update_locations:boolean;
    enable_update_locations: React.Dispatch<React.SetStateAction<boolean>>;

    bool_location_background_started:boolean;
    set_location_background_started: React.Dispatch<React.SetStateAction<boolean>>;

    arr_location_history:Array<object>;
    set_location_history: React.Dispatch<React.SetStateAction<Array<object>>>;
    position_dict:Array<PositionDict>;
    set_position_dict: React.Dispatch<React.SetStateAction<Array<PositionDict>>>;

    moveableImages:Array<MoveableImageDict>;
    setMoveableImages: React.Dispatch<React.SetStateAction<Array<MoveableImageDict>>>;

    initTimestamp: number;
    setInitTimestamp: React.Dispatch<React.SetStateAction<number>>;
    lastTimestamp: number;
    setLastTimestamp: React.Dispatch<React.SetStateAction<number>>;

    activeTime: number;
    setActiveTime: React.Dispatch<React.SetStateAction<number>>;
    passiveTime: number;
    setPassiveTime: React.Dispatch<React.SetStateAction<number>>;
    totalTime: number;
    setTotalTime: React.Dispatch<React.SetStateAction<number>>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a AppStateProvider');
  }
  return context;
};

interface Props {children: React.ReactNode;}
export const AppStateProvider: React.FC<Props> = ({ children }) => {
    const [permits, set_permits] = useState(INIT_PERMITS);
    const [bool_location_background_started, set_location_background_started] = useState(false);
    const [bool_update_locations, enable_update_locations] = useState(false);
    const [current_location, set_current_location] = useState(INIT_POSITION);
    const [bool_record_locations, enable_record_locations] = useState(false);
    const [arr_location_history, set_location_history] = useState(new Array(INIT_POSITION));
    const [position_dict, set_position_dict] = useState(new Array<PositionDict>());

    const [initTimestamp, setInitTimestamp] = useState(null);
    const [lastTimestamp, setLastTimestamp] = useState(null);

    const [activeTime, setActiveTime] = useState(0);
    const [passiveTime, setPassiveTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);

    var [moveableImages, setMoveableImages] = useState([
      {positionX: 75,positionY: 250,selected: false,},
      {positionX: 275,positionY: 250,selected: false,},
      {positionX: 175,positionY: 550,selected: false,},]);

  return (
    <StateContext.Provider
      value={{  permits, set_permits, 
                bool_location_background_started, set_location_background_started,
                current_location, set_current_location, 
                bool_record_locations, enable_record_locations, 
                bool_update_locations, enable_update_locations,
                arr_location_history, set_location_history,
                position_dict, set_position_dict,
                moveableImages, setMoveableImages,

                initTimestamp, setInitTimestamp,
                lastTimestamp, setLastTimestamp,

                activeTime, setActiveTime,
                passiveTime, setPassiveTime,
                totalTime, setTotalTime,
            }}
    >
      {children}
    </StateContext.Provider>
  );
};