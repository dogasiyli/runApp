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