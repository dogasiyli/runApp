import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    container2: {
      flex: 1,
      backgroundColor: '#f0f',
      alignItems: 'center',
      justifyContent: 'center',
    },
    Moveable_touchable: {
      position: 'absolute',
    },
    Moveable_button: {
      position:"absolute", 
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    Moveable_image: {
      width: 30,
      height: 30,
    },
    Moveable_imageWrapper: {
      width: 60, // Adjust the desired width
      height: 60, // Adjust the desired height
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  