export interface TimestampDiffInfoProps {
    Formatted_Time_Diff: string;
    Diff_In_Seconds: number;
}

export interface SpeedTimeInfo {
  s60: number;
  s30: number;
  s10: number;
  t60: number;
  t30: number;
  t10: number;
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
    floatVal: number;
    backgroundColor: string;
    top:string;
    left:string;
  }

  export interface CircleImagePaceProps {
    renderBool: boolean;
    speed_kmh: number;
    beforeText?: string;
    afterText?: string;
    top: string;
    left: string;
  }

export interface MoveableImageProps {
  id:number;
  renderBool: boolean;
}
