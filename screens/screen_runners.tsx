import { View, Text, ScrollView, Image, DimensionValue, TouchableOpacity, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Screen_Runners({navigation}) {
  const insets = useSafeAreaInsets();
  const basak = require('../assets/runners/basak.png');
  const gurkan = require('../assets/runners/gurkan.png');
  const kamil = require('../assets/runners/kamil.png');
  const insta_icon = require('../assets/pngs/insta_icon.png');
  const strava_icon = require('../assets/pngs/strava_icon.png');

  const fontFamilies: string[] = [
    "normal","notoserif","sans-serif","sans-serif-light","sans-serif-thin","sans-serif-condensed","sans-serif-medium","serif","Roboto","monospace",
  ];
  const picked_font_style = 6;
  const fontsizes: number[] = [18, 14];
  const imw = 120;
  const imh = 120;
  type BackgroundColor = {
    [key: string]: string;
  };

    interface RunnerViewProps {
        renderBool:boolean;
        imSrc:any;
        marginTop:DimensionValue;
        titleString:string;
        explanationString:string;
        backgroundColor:BackgroundColor;
        instaLink?:string;
        stravaLink?:string;
    }
    const RunnerView: React.FC<RunnerViewProps> = ({ 
    renderBool, 
    imSrc,
    marginTop,
    titleString,
    explanationString,
    backgroundColor,
    instaLink=null,
    stravaLink=null,
    }) => {
    if (!renderBool) {
        return null;
    }
    return (  
        <>
        <View style={{ flex: 1, marginTop:marginTop, alignSelf:"center", alignItems:"center", alignContent:"center",
                    width:"100%", backgroundColor:backgroundColor["all"], borderRadius:30 }}>
            <Text style={{fontSize: fontsizes[0], fontStyle:'normal', fontFamily: fontFamilies[picked_font_style]}}>{titleString}</Text>

            <View style={{ flex: 1, flexDirection: "row", alignSelf: "center", alignItems: "center", alignContent: 'center', width: "100%" }}>

                <TouchableOpacity onPress={() => Linking.openURL(instaLink)}>
                    <Image source={insta_icon} style={{width:55, height:55, backgroundColor: "transparent" }} />
                </TouchableOpacity>

                <Image source={imSrc} style={{ width:250, height:250, backgroundColor: backgroundColor["photo"], borderRadius: 70 }} />
                
                <TouchableOpacity onPress={() => Linking.openURL(stravaLink)}>
                    <Image source={strava_icon} style={{ width:55, height:55, backgroundColor: "transparent" }} />
                </TouchableOpacity>

            </View>
            
            <View style={{ flex: 1, alignSelf:"center", alignItems:"center", alignContent:"center",
                        width:"95%"}}>
                <Text style={{fontSize: fontsizes[1], fontStyle:'italic', fontFamily: fontFamilies[picked_font_style]}}>
                    {explanationString}
                </Text>
            </View>
        </View>
        </>
    );
    };

  return (
    <>
    <StatusBar backgroundColor="white" style="auto" />
    <View style={{ flex: 1, alignItems:"center", alignContent:"center", paddingTop: insets.top, backgroundColor: "#a7f" }}>
        <ScrollView>
        
            <RunnerView renderBool={true} marginTop={0}
                        imSrc={basak}  
                        titleString="Queen of Trails" 
                        explanationString="Başak Ağdaş, a trailblazer in the world of ASICS, reigns as the ultimate Queen of Trails. Her expertise in all things related to trail running is unparalleled, making her the go-to source for advice and inspiration." 
                        backgroundColor={{ all: "#f88", photo: "#944" }}
                        instaLink="https://www.instagram.com/agdasbasak"
                        stravaLink='https://www.strava.com/athletes/98965451'
                        />
            
            <RunnerView renderBool={true} marginTop={5}
                        imSrc={gurkan}
                        titleString="The Indestructable" 
                        explanationString="Gürkan Kazancı, an unstoppable force within ASICS, embodies unwavering resilience. There is no summit too high, nor challenge too daunting to deter him from forging ahead." 
                        backgroundColor={{ all: "#88f", photo: "#aff" }}
                        instaLink='https://www.instagram.com/gurkankazanci'
                        stravaLink='https://www.strava.com/athletes/25235731'
                        />

            <RunnerView renderBool={true} marginTop={5}
                        imSrc={kamil}
                        titleString="The King of Distances" 
                        explanationString="Kamil, a reigning monarch of ASICS, holds the crown as the indomitable King of Distances. No matter the length or arduousness of the journey, he continues to push forward, persisting until the finish line is conquered." 
                        backgroundColor={{ all: "#8f8", photo: "#ffa" }}
                        instaLink='https://www.instagram.com/demirk5'
                        stravaLink='https://www.strava.com/athletes/93987912'
                        />
        </ScrollView>
    </View>
    </>
  );
}   