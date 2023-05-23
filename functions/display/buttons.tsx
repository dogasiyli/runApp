import { Image, TouchableHighlight, View, PanResponder, Vibration } from 'react-native';
import { Switch } from 'react-native-switch';  
import { useAppState } from '../../assets/stateContext';
import React, { useContext, useRef, useState } from 'react';

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

interface MoveableImageProps {
  id:number;
  renderBool: boolean;
}

const toggle = (setFunction) => setFunction(previousState => !previousState);  
//https://github.com/shahen94/react-native-switch
export const BT_toggleSavePosition: React.FC<ViewRCProps> = ({renderBool, trueStr, falseStr}) => {
  const { bool_record_locations, enable_record_locations } = useAppState();
  if (!renderBool) {
    return null;
  }
  return (
   <View style={{flex:1, position: "absolute", marginTop:"30%", justifyContent: 'center', alignItems: 'center'}}>
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