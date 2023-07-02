import { SpeedTimeCalced_Dict } from "./types";
export interface TimestampDiffInfoProps {
    Formatted_Time_Diff: string;
    Diff_In_Seconds: number;
}

export interface ViewRCProps {
    trueStr:string;
    falseStr:string;
    renderBool: boolean;
  }

export interface CircleTextGPSProps {
  renderBool: boolean;
  top:string;
  left:string;
}
export interface ToggleImageProps {
  renderBool: boolean;
  top:string; 
  left:string;
  size:number;
  bool_val:boolean;
  set_bool_val:any;
  true_img:string;
  false_img:string;
}
export interface CircleClickableProps {
  renderBool: boolean;
  top:string;
  left:string;
  size_perc:number;
  nav:any;
  page_name:string;
  page_navigate_str:string;
  display_page_mode?:string;
}

export interface DisplayDataProps {
  renderBool: boolean;
  current_location: object;
  top:string;
  left:string;
}

export interface CircleTextErrorProps {
  renderBool: boolean;
  dispVal: number | string;
  beforeText: string;
  afterText: string;
  floatVal: number;
  tresholds: Array<number>;
  top:string;
  left:string;
}

export interface CircleTextColorProps {
    renderBool: boolean;
    dispVal: number | string;
    beforeText: string;
    afterText: string;
    floatVal?: number;
    backgroundColor: string;
    top:string|number;
    left:string|number;
    circleSize?: number;
  }

  export interface CircleImagePaceProps {
    renderBool: boolean;
    speed_kmh: number;
    time_diff: number;
    beforeText?: string;
    afterText?: string;
    top: string;
    left: string;
  }

  export interface CircleImagePaceV1Props {
    renderBool: boolean;
    stDict:SpeedTimeCalced_Dict,
    value:number,
    time_dist:string,
    last_or_best:string,
    beforeText?: string;
    afterText?: string;
    top: string;
    left: string;
  }


export interface MoveableImageProps {
  id:number;
  renderBool: boolean;
}

export interface CircleTimerTriangleProps {
  renderBool: boolean;
  totalTime: number;
  activeTime: number;
  passiveTime: number;
  top: number;
  left: number;
}

export interface CoveredDistanceProps {
  renderBool: boolean;
  covered_dist:any;
  dist_type_totalT_lastF:boolean;
  set_dist_type:any;
  top:string; 
  left:string;
}

export interface PickedPaceProps {
  renderBool: boolean;
  covered_dist:any;
  stDict:any;
  dist_type_totalT_lastF:boolean;
  activeTime:number;
  pace_type_aveT_curF:boolean;
  set_pace_type_aveT_curF:any;
  top:string; 
  left:string;
}