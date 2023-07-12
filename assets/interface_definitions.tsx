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
  press_type?:string;
  underlayColor?:string;
  toggle_func?:any;
  toggle_val?:any;
  belowText?:string;
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
  size?:number;
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
    textColor?: string;
    size?:number;
  }

  export interface CircleImagePaceProps {
    renderBool: boolean;
    speed_kmh: number;
    time_diff: number;
    beforeText?: string;
    afterText?: string;
    top: string;
    left: string;
    size?:number;
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
    size?:number;
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

export interface IMapLocation {
  latitude: number;
  longitude: number;
  activityType?: string;
}

export interface IMapRegion{
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface IMapBoundaries{
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
  lat_delta: number;
  lon_delta: number;
}

export interface IMapPolyGroupMember{
  from: number;
  to: number;
  actType: string;
}

export interface IMapViewProps {
  detailValue: number;
  mapTypeString: string;
  centerAt: 'runner' | 'map';
  zoomLevel: number;
}

export interface IMapData {
  locations: Array<IMapLocation>;
  polyGroup: Array<IMapPolyGroupMember>;
  loc_boundaries: IMapBoundaries;
  initial_region: IMapRegion;
  region: IMapRegion;
  viewProps: IMapViewProps;
}