import { Image, TouchableHighlight, View } from 'react-native';
import { Switch } from 'react-native-switch';  
import { useAppState } from '../../assets/stateContext';
import React from 'react';

import { styles } from '../../sheets/styles';

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
    //console.log('MoveableImage rendered');
    if (!renderBool) {
      return null;
    }
    const onPressButton = () => {
      // Handle press logic
    };
  
    const onLongPressButton = () => {
      setMoveableImages((prevMoveableImages) => {
        const updatedImages = prevMoveableImages.map((image, index) => {
          if (index === id) {
            return { ...image, selected: !image.selected };
          } else if (image.selected) {
            return { ...image, selected: false };
          }
          return image;
        });
        return updatedImages;
      });
    };

    const buttonImage = moveableImages[id].selected
      ? button_images["moveable_selected"]
      : button_images["moveable_default"];

    return ( 
      <View style={[styles.Moveable_button, 
                      { left: moveableImages[id].positionX, 
                        top: moveableImages[id].positionY}]}>
        <TouchableHighlight
        onPress={onPressButton}
        onLongPress={onLongPressButton}
        underlayColor={moveableImages[id].selected ? "rgba(255, 0, 0, 0.5)": "rgba(0, 255, 255, 0.5)"}
        style={styles.Moveable_touchable}
      >
          <View style={styles.Moveable_imageWrapper}>
            <Image source={buttonImage} style={styles.Moveable_image} />
          </View>
      </TouchableHighlight>
    </View>
    );
};