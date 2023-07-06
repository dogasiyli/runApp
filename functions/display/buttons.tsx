import { Text, Image, TouchableHighlight, View, PanResponder, Vibration, Dimensions } from 'react-native';
import { Switch } from 'react-native-switch';  
import { useAppState } from '../../assets/stateContext';
import React, { useContext, useRef, useState } from 'react';

import { style_movable } from '../../sheets/styles';
import { format_time_diff, calc_pace_from_kmh } from '../../asyncOperations/utils';

import { ViewRCProps, CircleTextErrorProps, CircleTextColorProps, CircleTextGPSProps, CircleClickableProps,
         CircleImagePaceProps, DisplayDataProps, MoveableImageProps, ToggleImageProps } from '../../assets/interface_definitions';
import { getReadableDuration } from '../../asyncOperations/fileOperations';
import { Picker } from '@react-native-picker/picker';

const button_images = {
  "moveable_default": require('../../assets/pngs/defaultMoveable.png'),
  "moveable_selected": require('../../assets/pngs/selectedMoveable.png'),
}

const run_images = {
  "standing": require('../../assets/pngs/standing.png'),
  "walk": require('../../assets/pngs/walk.png'),
  "jog": require('../../assets/pngs/jog.png'),
  "run_slow": require('../../assets/pngs/run_slow.png'),
  "run_fast": require('../../assets/pngs/run_fast.png'),
  "cycling": require('../../assets/pngs/cycling.png'),
}
const speed_screen_images = {
  "time": require('../../assets/pngs/time.png'),
  "dist": require('../../assets/pngs/dist.png'),
  "best": require('../../assets/pngs/best.png'),
  "last": require('../../assets/pngs/last.png'),
  "gps" : require('../../assets/pngs/gps.png'),
  "no-gps": require('../../assets/pngs/no-gps.png'),
  "camera": require('../../assets/pngs/camera.png'),
  "run": require('../../assets/pngs/run.png'),
  "pause": require('../../assets/pngs/pause.png'),
  "finish": require('../../assets/pngs/finish.png'),
  "share": require('../../assets/pngs/share.png'),
  "stats": require('../../assets/pngs/stats.png'),
  "simulate": require('../../assets/pngs/simulate.png'),
  "wait": require('../../assets/pngs/wait.png'),
}
const run_image_ident = {
  "run00": "standing",
  "run01": "walk",
  "run02": "jog",
  "run03": "run_slow",
  "run04": "run_fast",
  "run05": "cycling",
}
const run_tresholds = [1, 4, 8, 12, 15]; // Thresholds array
//const run_tresholds = [1, 2, 3, 4, 5]; // Thresholds array
const run_colors = ["#404080", "#0000ff", "#44aa00", "#ff8800", "#880000"]; // Colors array
const minPace = run_tresholds[0];
const maxPace = run_tresholds[run_tresholds.length - 1];

const calculatePaceRGB = (pace: number) => {
  try {
    const normalizedPace = Math.max(minPace, Math.min(maxPace, pace));
    const index1 = Math.min(Math.floor((normalizedPace - minPace) / (maxPace - minPace) * (run_colors.length - 1)), run_colors.length - 1);
    const index2 = Math.min(index1 + 1, run_colors.length - 1);
    const color1 = run_colors[index1];
    const color2 = run_colors[index2];
    const percentage = (normalizedPace - run_tresholds[index1]) / (run_tresholds[index2] - run_tresholds[index1]);
    
    const R = Math.round(parseInt(color1.slice(1, 3), 16) * (1 - percentage) + parseInt(color2.slice(1, 3), 16) * percentage);
    const G = Math.round(parseInt(color1.slice(3, 5), 16) * (1 - percentage) + parseInt(color2.slice(3, 5), 16) * percentage);
    const B = Math.round(parseInt(color1.slice(5, 7), 16) * (1 - percentage) + parseInt(color2.slice(5, 7), 16) * percentage);

    return `rgb(${isNaN(R) ? 0 : R}, ${isNaN(G) ? 0 : G}, ${isNaN(B) ? 0 : B})`;
  } catch (e) {
    return `rgb(255,0,0)`;
  }
};

const selectRunImage = (pace: number) => {
  let imageName = 'run05'; // Highest pace
  for (let i = 0; i < run_tresholds.length; i++) {
    if (pace < run_tresholds[i]) {
      imageName = `run0${i}`;
      break;
    }
  }

  return run_images[run_image_ident[imageName]];
};

const toggle = (setFunction) => setFunction(previousState => !previousState);  
//https://github.com/shahen94/react-native-switch
export const BT_toggleSavePosition: React.FC<ViewRCProps> = ({renderBool, trueStr, falseStr}) => {
  const { bool_record_locations, bool_update_locations, enable_record_locations } = useAppState();
  if (!renderBool || !bool_update_locations) {
    return null;
  }
  return (
   <View style={{flex:1, position: "absolute", marginTop:"25%", left:"9%", justifyContent: 'flex-start', alignItems: 'center'}}>
    <Switch 
          value={bool_record_locations}
          disabled={false}
          onValueChange={() => toggle(enable_record_locations)}
          activeText={trueStr}
          inActiveText={falseStr}
          backgroundInactive={'#00ff00'}
          backgroundActive={'#ff0000'}
          circleInActiveColor={'#00ffff'}
          circleActiveColor={'#ff00ff'}
          changeValueImmediately={true}
          switchWidthMultiplier={2}
   />  
  </View>
  );
};
export const BT_toggleUpdatePosition: React.FC<ViewRCProps> = ({renderBool, trueStr, falseStr}) => {
  const { bool_update_locations, enable_update_locations } = useAppState();
  if (!renderBool) {
    return null;
  }
  return (
   <View style={{flex:1, flexGrow:1, flexShrink:1, position: "absolute", marginTop:"25%", left:"10%", justifyContent: 'flex-start', alignItems: 'center'}}>
    <Switch 
          value={bool_update_locations}
          disabled={false}
          onValueChange={() => toggle(enable_update_locations)}
          activeText={trueStr}
          inActiveText={falseStr}
          backgroundInactive={'#00ff00'}
          backgroundActive={'#ff0000'}
          circleInActiveColor={'#00ffff'}
          circleActiveColor={'#ff00ff'}
          changeValueImmediately={true}
          switchWidthMultiplier={2}
   />  
  </View>
  );
};
export const BT_toggleLocationTrackingBG: React.FC<ViewRCProps> = ({renderBool, trueStr, falseStr}) => {
  const { bool_location_background_started, set_location_background_started } = useAppState();
  if (!renderBool) {
    return null;
  }
  return (
   <View style={{flex:1, position: "absolute", marginTop:"20%", justifyContent: 'center', alignItems: 'center'}}>
    <Switch 
          value={bool_location_background_started}
          disabled={false}
          onValueChange={() => toggle(set_location_background_started)}
          activeText={trueStr}
          inActiveText={falseStr}
          backgroundInactive={'#0000ff'}
          backgroundActive={'#ff5500'}
          circleInActiveColor={'#0055ff'}
          circleActiveColor={'#ff3399'}
          changeValueImmediately={true}
          switchWidthMultiplier={2}
   />  
  </View>
  );
};

export const BT_Circle_Text_GPS: React.FC<CircleTextGPSProps> = ({ renderBool, top, left }) => {
  const { bool_update_locations, bool_record_locations, enable_update_locations, enable_record_locations } = useAppState();

  if (!renderBool) {
    return null;
  }
  const { width } = Dimensions.get('window');
  const circleSize = width * 0.15; // Adjust the percentage as needed
  const bgc = bool_update_locations ? (bool_record_locations ? '#ff0000' : '#00ffff') : '#777777';
  const s = bool_update_locations ? (bool_record_locations ? 'GPS Rec' : 'GPS On') : 'GPS Off';
  return (
    <View style={{ flex: 1, position: 'absolute', marginTop: top, left: left, justifyContent: 'flex-start', alignItems: 'center' }}>
      <TouchableHighlight underlayColor="transparent" 
                          onPress={bool_record_locations ? () => { toggle(enable_record_locations); } : () => toggle(enable_update_locations)}
                          onLongPress={bool_update_locations ? () => toggle(enable_record_locations) : undefined}>
        <View style={{ borderRadius: circleSize / 2, overflow: 'hidden' }}>
          <Text
            disabled={false}
            style={{ backgroundColor:bgc, width: circleSize, height: circleSize, textAlign: 'center', lineHeight: circleSize, borderRadius: circleSize / 2 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {s}
          </Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export const Circle_Text_Error: React.FC<CircleTextErrorProps> = ({ 
  renderBool, dispVal, 
  beforeText='', afterText='', 
  floatVal, 
  size=0.22,
  top, left, tresholds }) => {
  if (!renderBool) {
    return null;
  }

  const { width } = Dimensions.get('window');
  const circleSize = width * size; // Adjust the percentage as needed

  const T = tresholds; // Thresholds array

  const R = Math.round(Math.max(0, Math.min(255, floatVal < T[0] ? 0 : floatVal <= T[1] ? (floatVal - T[0]) * (255 / (T[1] - T[0])) : 255)));
  const G = Math.round(Math.max(0, Math.min(255, floatVal < T[1] ? 255 : floatVal <= T[2] ? (T[2] - floatVal) * (255 / (T[2] - T[1])) : 0)));
  const B = Math.round(Math.max(0, Math.min(255, floatVal < T[0] ? 255 : floatVal <= T[1] ? (T[1] - floatVal) * (255 / (T[1] - T[0])) : 0)));

  const backgroundColor = floatVal < 0 ? `rgb(200,200,200)` :`rgb(${R}, ${G}, ${B})`;

  return (
    <View style={{ flex: 1, position: 'absolute', marginTop: top, left: left, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <View style={{ borderRadius: circleSize / 2, overflow: 'hidden' }}>
        <Text
          disabled={false}
          style={{ backgroundColor:backgroundColor, width: circleSize, height: circleSize, textAlign: 'center', 
                   lineHeight: circleSize, borderRadius: circleSize / 2,
                   top:0, marginBottom:10}}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
             {beforeText} {typeof dispVal === 'string' ? dispVal : ''} 
        </Text>
        <Text style={{bottom:circleSize/2, textAlign: 'center'} }>
          {typeof dispVal === 'number' ? dispVal.toFixed(3) : ''} 
          {afterText}
        </Text>
      </View>
    </View>
  );
};

export const Circle_Text_Color: React.FC<CircleTextColorProps> = ({ 
  renderBool, dispVal, 
  circleSize=0.22, 
  beforeText='', afterText='', 
  floatVal=-1, 
  top, left, 
  textColor="black",
  backgroundColor }) => {
  if (!renderBool) {
    return null;
  }

  const { width } = Dimensions.get('window');
  const circleW = width * circleSize; // Adjust the percentage as needed

  return (
    <View style={{ flex: 1, position: 'absolute', marginTop: top, left: left, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <View style={{ borderRadius: circleW / 2, overflow: 'hidden' }}>
        <Text
          disabled={false}
          style={{ backgroundColor:backgroundColor, width: circleW, height: circleW, textAlign: 'center', 
                   lineHeight: circleW, borderRadius: circleW / 2, color:textColor,
                   top:0, marginBottom:20}}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
             {beforeText} {typeof dispVal === 'string' ? dispVal : ''} 
        </Text>
        <Text style={{bottom:circleW/2, textAlign: 'center', color:textColor} }>
          {typeof dispVal === 'number' ? dispVal.toFixed(3) : ''} 
          {afterText}
        </Text>
      </View>
    </View>
  );
};

export const DataAgeInSec: React.FC<DisplayDataProps> = ({ renderBool, top, left, current_location }) => {
  if (!renderBool) {
    return null;
  }
  const timestamp = current_location["timestamp"];
  const {Formatted_Time_Diff: formattedTimestamp, Diff_In_Seconds: diffInSeconds} = format_time_diff(Date.now()-timestamp);
  return (

    <Circle_Text_Error renderBool={true} 
    dispVal={formattedTimestamp} 
    floatVal={diffInSeconds}
    tresholds={[3, 5, 10]} top={top} left={left}
    beforeText='' afterText='DataAge'/>
  );
};

export const MoveableImage: React.FunctionComponent<MoveableImageProps> = ({id, renderBool}) => {
  const { moveableImages, setMoveableImages } = useAppState();

  if (!renderBool) {
    return null;
  }

  const image = moveableImages[id];
  const [selected, setSelected] = useState(image.selected);
  const [position, setPosition] = useState({ x: image.positionX, y: image.positionY });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSelected(true);
        Vibration.vibrate([0, 40, 20, 40]);
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = {
          x: image.positionX + gestureState.dx,
          y: image.positionY + gestureState.dy,
        };
        setPosition(newPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        Vibration.vibrate(300);
        const newPosition = {
          x: image.positionX + gestureState.dx,
          y: image.positionY + gestureState.dy,
        };
        setSelected(false);
        updatePositionInState(newPosition);
      },
      onPanResponderTerminate: () => {
        setSelected(false);
      },
    })
  ).current;

  const updatePositionInState = (newPosition) => {
    moveableImages[id].positionX = newPosition.x;
    moveableImages[id].positionY = newPosition.y;
    setMoveableImages(moveableImages);
  };

  const buttonImage = selected
    ? button_images['moveable_selected']
    : button_images['moveable_default'];

  return (
    <View style={[style_movable.button, {left: position.x, top: position.y }]} >
      <TouchableHighlight
        underlayColor={selected ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 255, 0.5)'}
        style={style_movable.touchable}
      >
        <View style={[style_movable.imageWrapper, selected && style_movable.selectedImageWrapper]} {...panResponder.panHandlers}>
          <Image source={buttonImage} style={style_movable.image} />
        </View>
      </TouchableHighlight>
    </View>
  );
};

export const Circle_Image_Pace: React.FC<CircleImagePaceProps> = ({
  renderBool,
  speed_kmh,
  time_diff,
  beforeText = '',
  afterText = '',
  size = 0.15,
  top,
  left,
}) => {
  if (!renderBool) {
    return null;
  }

  const { width } = Dimensions.get('window');
  const circleSize = width * size; // Adjust the percentage as needed

  const backgroundColor = calculatePaceRGB(speed_kmh);
  const imageSource = selectRunImage(speed_kmh);
  let paceFloat = calc_pace_from_kmh(speed_kmh, false);
  paceFloat = paceFloat < 0.05 ? 0.0 : paceFloat;
  afterText = afterText=='' ? (paceFloat > 0.1 ? 'pace:'+getReadableDuration(paceFloat*60000) : '') : afterText
  if (beforeText==="meters")
  {
    let distance_meters = 1000* speed_kmh * (time_diff / (60 * 60));
    //console.log("check:", distance_meters, speed_kmh, time_diff)
    beforeText = distance_meters  < 500 ? distance_meters.toFixed(1) + "mt" : (distance_meters/1000).toFixed(2) + "km";
  }
  if (beforeText==="seconds")
  {
    beforeText = time_diff ? time_diff.toFixed(0) + "sec" : "-";
  }
  const afterTextFontSize = afterText.length > 10 ? 10 : 20;

  return (
    <View
      style={{
        flex: 1,
        position: 'absolute',
        marginTop: top,
        left: left,
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
      <Text style={{ bottom: circleSize / 8, textAlign: 'center', color: 'yellow', fontSize:12 }}>
          {beforeText}
        </Text>
      <View style={{ borderRadius: circleSize / 2, overflow: 'hidden' }}>
        <Image
          source={imageSource}
          style={{
            backgroundColor: backgroundColor,
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            top: 0,
            marginBottom: 10,
          }}
        />
        <Text style={{ bottom: circleSize / 8, textAlign: 'center', color:"white", fontSize:20 }}>
          {speed_kmh.toFixed(1)}kmh
        </Text>        
        <Text style={{ bottom: circleSize / 5.5, textAlign: 'center', color:"white", fontSize:afterTextFontSize }}>
          {afterText}
        </Text>
      </View>
    </View>
  );
};

export const BT_Circle_Clickable: React.FC<CircleClickableProps> = ({ 
  renderBool, 
  top, left, size_perc, 
  nav, page_name, page_navigate_str, display_page_mode }) => {
  if (!renderBool) {
    return null;
  }
  const { width } = Dimensions.get('window');
  const circleSize = width * size_perc; // Adjust the percentage as needed
  const bgc = '#ff7777';
  return (
    <View style={{ flex: 1, position: 'absolute', marginTop: top, left: left, justifyContent: 'flex-start', alignItems: 'center' }}>
      <TouchableHighlight underlayColor="transparent" 
                          onPress={() => nav.navigate(page_navigate_str, {display_page_mode:display_page_mode})} >
        <View style={{ borderRadius: circleSize / 2, overflow: 'hidden' }}>
          <Text
            disabled={false}
            style={{ backgroundColor:bgc, width: circleSize, height: circleSize, textAlign: 'center', lineHeight: circleSize, borderRadius: circleSize / 2 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {page_name}
          </Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export const BT_Toggle_Image: React.FC<ToggleImageProps> = ({ 
  renderBool, 
  top, left, size,
  bool_val, set_bool_val, 
  true_img, false_img,
  toggle_func=undefined, toggle_val=undefined,
  press_type="long", underlayColor="transparent",
  belowText=undefined
  }) => {
  if (!renderBool) {
    return null;
  }
  const { width } = Dimensions.get('window');
  const circleSize = width * size; // Adjust the percentage as needed
  const bgc = 'transparent';
  const s = belowText===undefined ? (bool_val ? true_img : false_img) : belowText;
  const imageSource = bool_val ? speed_screen_images[true_img] : speed_screen_images[false_img];
  toggle_val = toggle_val===undefined ? set_bool_val : toggle_val;
  toggle_func = toggle_func===undefined ? toggle : toggle_func;

  return (
    <View style={{ flex: 1, position: 'absolute', top:top, left: left, justifyContent: 'flex-start', alignItems: 'center' }}>
      <TouchableHighlight underlayColor={"transparent"} 
                          onPress={press_type === "short" || press_type === "both" ? () => toggle_func(toggle_val) : undefined}
                          onLongPress={press_type === "long" || press_type === "both" ? () => toggle_func(toggle_val) : undefined}>
      <View style={{backgroundColor:underlayColor, borderRadius: circleSize / 2, overflow: 'hidden', alignSelf:"center", alignItems:"center" }}>
        <Image
          source={imageSource}
          style={{
            backgroundColor: bgc,
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 4,
            top: 0,
            marginBottom: 0,
          }}
        /> 
      </View>
      </TouchableHighlight>
      <View style={{backgroundColor:"transparent", borderRadius: circleSize / 2, overflow: 'hidden', alignSelf:"center", alignItems:"center" }}>
          <Text
            disabled={false}
            style={{ backgroundColor:bgc, width: circleSize, height: circleSize, 
                     textAlign: 'center', lineHeight: circleSize/2, color:"yellow", fontSize:circleSize/6,
                     borderRadius: circleSize / 4 }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {s.toUpperCase()}
          </Text>
        </View>
    </View>
  );
};


interface BT_Picker_Props {
  renderBool: boolean;
  top:string; 
  left:string;
  width?:string;
  pickableBool?:boolean;
  items:string[] | number[];
  value:string | number;
  setValue:React.Dispatch<React.SetStateAction<string|number>>;
  borderRadius?:number;
  borderWidth?:number; 
  borderColor?:string;
  belowText?:string;
  textColor?:string;
  itemLabelsAddLast?:string;
  itemLabelsAddFirst?:string;
  fontSize?:number;
}
export const BT_Picker: React.FC<BT_Picker_Props> = ({ 
    renderBool, 
    items,
    top, left, 
    value, setValue, 
    pickableBool=true,
    width="100%",
    borderRadius=20,
    borderWidth=1,
    borderColor="#777733",
    belowText=undefined,
    textColor="white",
    itemLabelsAddLast="",itemLabelsAddFirst="",
    fontSize=12
    }) => {
    if (!renderBool) {
      return null;
    }
    const handleValueChange = (itemValue) => {
      setValue(itemValue);
    };
    return (  
      <View style={{
        flex: 1, position: 'absolute',
        top:top, left:left, width:width,
        alignContent:"center", alignSelf:"center",
        backgroundColor: '#000088',
        borderRadius: borderRadius, borderWidth:borderWidth, borderColor:borderColor, overflow: 'hidden'}}>
      <Picker
        enabled={pickableBool}
        selectedValue={value}
        onValueChange={handleValueChange}
        style={{ color: 'black', backgroundColor: '#998888', width:'100%' }}
      >
        {items.map((item, index) => (
          <Picker.Item style={{fontSize:fontSize, color:textColor, backgroundColor: '#888800'}} 
                       key={index} 
                       label={(itemLabelsAddFirst)+(typeof item === 'number' ? item.toString() : item)+(itemLabelsAddLast)}  
                       value={item} 
                       />
        ))}
      </Picker>
      <Text style={{ alignSelf: 'center', marginTop: 10, color: textColor }}>
        {belowText}
      </Text>
    </View>
    );
  };


  // interface BT_Picker_Props {
  //   renderBool: boolean;
  //   top:string; 
  //   left:string;
  //   width?:string;
  //   pickableBool?:boolean;
  //   items:string[] | number[];
  //   value:string | number;
  //   setValue:React.Dispatch<React.SetStateAction<string|number>>;
  //   borderRadius?:number;
  //   borderWidth?:number; 
  //   borderColor?:string;
  //   belowText?:string;
  //   textColor?:string;
  // }
// export const BT_F: React.FC<F_Props> = ({ 
  // renderBool, 
  // items,
  // top, left, 
  // value, setValue, 
  // pickableBool=true,
  // width="100%",
  // borderRadius=20,
  // borderWidth=1,
  // borderColor="#777733",
  // belowText=undefined,
  // textColor="white"
//   }) => {
//   if (!renderBool) {
//     return null;
//   }
//   return (  
//     <>
//     </>
//   );
// };