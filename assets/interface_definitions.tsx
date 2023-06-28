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



export interface MoveableImageProps {
  id:number;
  renderBool: boolean;
}
