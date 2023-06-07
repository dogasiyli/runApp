import { Text, View } from 'react-native';

const getReadableTime = (timeStamp:number) : string => {
    var t = new Date(timeStamp);
    var hours = t.getHours();
    var minutes = t.getMinutes();
    var seconds = t.getSeconds();
    var milseconds = t.getMilliseconds();
    var newformat = t.getHours() >= 12 ? 'PM' : 'AM';  
    
    // Find current hour in AM-PM Format 
    hours = hours % 12;  
    // To display "0" as "12" 
    hours = hours ? hours : 12;  
    var formatted = 
        (t.toString().split(' ')[0]) 
        + ', ' +('0' + t.getDate()).slice(-2) 
        + '/' + ('0' + (t.getMonth() + 1) ).slice(-2)
        + '/' + (t.getFullYear())
        + ' - ' + ('0' + hours).slice(-2)
        + ':' + ('0' + minutes).slice(-2)
        + ':' + ('0' + seconds).slice(-2)
        + '.' + ('000' + milseconds).slice(-3)
        + ' ' + newformat;
    return formatted;
};

export function showGPSResults(location:object, renderBool:boolean) {
  if (!renderBool) {
    return null;
  }
    return (
      <View>
        <Text>Coords at : {getReadableTime(location["timestamp"])}</Text>
        <Text>accuracy: {location["coords"]["accuracy"]} </Text>
        <Text>altitude: {location["coords"]["altitude"]} </Text>
        <Text>altitudeAccuracy: {location["coords"]["altitudeAccuracy"]} </Text>
        <Text>heading: {location["coords"]["heading"]} </Text>
        <Text>Latitude: {location["coords"]["latitude"]}</Text>
        <Text>Longitude: {location["coords"]["longitude"]}</Text>
        <Text>speed: {location["coords"]["speed"]}</Text>
        <Text>mocked: {location["mocked"] ? "Yes": "No"}</Text>
      </View>
    );
  }