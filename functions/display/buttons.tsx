import { Text, Image, TouchableHighlight, View, PanResponder, Vibration, Dimensions } from 'react-native';
import { Switch } from 'react-native-switch';  
import { useAppState } from '../../assets/stateContext';
import React, { useContext, useRef, useState } from 'react';
import Slider from '@react-native-community/slider';

import { style_movable } from '../../sheets/styles';

const button_images = {
  "moveable_default": require('../../assets/pngs/defaultMoveable.png'),
  "moveable_selected": require('../../assets/pngs/selectedMoveable.png'),
}

interface ViewRCProps {
    trueStr:string;
    falseStr:string;
    renderBool: boolean;
  }

interface CircleTextGPSProps {
  renderBool: boolean;
  top:string;
  left:string;
}

interface DisplayDataProps {
  renderBool: boolean;
  current_location: object;
  top:string;
  left:string;
}

interface CircleTextErrorProps {
  renderBool: boolean;
  dispVal: number | string;
  beforeText: string;
  afterText: string;
  floatVal: number;
  tresholds: Array<number>;
  top:string;
  left:string;
}
interface MoveableImageProps {
  id:number;
  renderBool: boolean;
}

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

export const Circle_Text_Error: React.FC<CircleTextErrorProps> = ({ renderBool, dispVal, beforeText='', afterText='', floatVal, top, left, tresholds }) => {
  if (!renderBool) {
    return null;
  }

  const { width } = Dimensions.get('window');
  const circleSize = width * 0.22; // Adjust the percentage as needed

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

interface TimestampInfo {
  formattedTimestamp: string;
  diffInSeconds: number;
}
const formatTimestamp = (timestamp: number): TimestampInfo => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  let formattedTimestamp = '';
  if (diffInSeconds < 1) {
    formattedTimestamp = `Smooth`;
  }
  else if (diffInSeconds < 60) {
    formattedTimestamp = `${diffInSeconds} sec`;
  } else {
    formattedTimestamp = '>1 min';
  }

  return {
    formattedTimestamp,
    diffInSeconds,
  };
};

export const DisplayData: React.FC<DisplayDataProps> = ({ renderBool, top, left, current_location }) => {
  if (!renderBool) {
    return null;
  }

  const timestamp = current_location["timestamp"];
  const { latitude, longitude, altitude } = current_location["coords"];
  const {formattedTimestamp, diffInSeconds} = formatTimestamp(timestamp);

  return (
    <Circle_Text_Error renderBool={true} 
    dispVal={formattedTimestamp} 
    floatVal={diffInSeconds}
    tresholds={[3, 5, 10]} top={top} left={left}
    beforeText='' afterText=''/>
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