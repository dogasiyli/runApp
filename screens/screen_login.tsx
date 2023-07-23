import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';

const redirectUri = makeRedirectUri({
  native: 'com.doga.siyli.runApp',
  scheme: 'com.doga.siyli.runApp',
})

WebBrowser.maybeCompleteAuthSession();

export function Screen_Login({route}) {
    const insets = useSafeAreaInsets();
    const [userInfo, setUserInfo] = React.useState(null);
    const [respShort, setRespShort] = React.useState("no resp yet");
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: "649280015379-ntapcvfntnts9kqqqjv1on37es253kit.apps.googleusercontent.com",
        androidClientId: "649280015379-fuf0n9jlo4jfphihr99mt2cbpediu4n9.apps.googleusercontent.com",
        webClientId: "923642295742-btb8d2faddi269o5tub8pu9hvg0jnqmc.apps.googleusercontent.com",
        redirectUri: redirectUri,
    });

  React.useEffect(() => {
    setRespShort(response?.type);
    handleSignInWithGoogle();
  }, [response]);

  async function handleSignInWithGoogle() {
    const user = await AsyncStorage.getItem('@user');
    if (!user)  {
      if (response?.type === "success")
      {
        await getUserInfo(response?.authentication?.accessToken);
      }
    }
    else {
      setUserInfo(JSON.parse(user));
    }

  }

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfoResponse = await response.json();
      await AsyncStorage.setItem('@user', JSON.stringify(userInfoResponse));
      setUserInfo(userInfoResponse);
    } catch {

    }
  }

  return (
    <View style={styles.container}>
      <Text style={{alignContent:"center", alignItems:"center"}}>user Info:{JSON.stringify(userInfo, null, 2)}</Text>
      <Text>respshort={respShort}</Text>
      <Text>ola to screen</Text>
      <Button title="Login via Google" onPress={() => promptAsync()} />
      <Button title="delete loc storage" onPress={() => AsyncStorage.removeItem("@user")} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent:"center",
    alignSelf:"center",
  },
});