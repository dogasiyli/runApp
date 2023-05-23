import { StyleSheet } from 'react-native';

export const style_container = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
      alignContent: 'center',
    },
});

export const style_home = StyleSheet.create({
  button: {
    position:"absolute", 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'purple',
  },
});
  

export const style_movable = StyleSheet.create({
  touchable: {
    position: 'absolute',
  },
  button: {
    position:"absolute", 
    width: 50,
    height: 50,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  image: {
    width: 30,
    height: 30,
  },
  selectedImageWrapper: {
    width: 60,
    height: 60,
    borderColor: 'blue',
    borderWidth: 2,
    borderRadius: 30,
  },
  imageWrapper: {
    width: 60, // Adjust the desired width
    height: 60, // Adjust the desired height
    alignItems: 'center',
    justifyContent: 'center',
  },
});
  