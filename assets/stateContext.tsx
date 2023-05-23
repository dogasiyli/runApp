import { createContext, useContext, useState } from 'react';
import { INIT_PERMITS, INIT_POSITION } from '../assets/constants';

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

    arr_location_history:Array<object>;
    set_location_history: React.Dispatch<React.SetStateAction<Array<object>>>;

    moveableImages:Array<MoveableImageDict>;
    setMoveableImages: React.Dispatch<React.SetStateAction<Array<MoveableImageDict>>>;
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
    const [current_location, set_current_location] = useState(INIT_POSITION);
    const [bool_record_locations, enable_record_locations] = useState(false);
    const [arr_location_history, set_location_history] = useState(new Array(INIT_POSITION));

    const [moveableImages, setMoveableImages] = useState([
      {positionX: 0,positionY: 0,selected: false,},
      {positionX: 260,positionY: 0,selected: false,},
      {positionX: 130,positionY: 700,selected: false,},]);

  return (
    <StateContext.Provider
      value={{  permits, set_permits, 
                current_location, set_current_location, 
                bool_record_locations, enable_record_locations, 
                arr_location_history, set_location_history,
                moveableImages, setMoveableImages,
            }}
    >
      {children}
    </StateContext.Provider>
  );
};