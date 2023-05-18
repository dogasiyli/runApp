import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
const { StorageAccessFramework } = FileSystem;

const getFormattedDateTime = () => {
    const date = new Date();

    // Format date and time in the format: yyyyMMdd_hhmmss
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    const formattedDateTime = `${year}${month}${day}_${hours}${minutes}${seconds}`;
    return   formattedDateTime
}
const saveToMediaLibrary = async (fileUri:string, parentUri:string, filename:string) => {
    // try {
    // const asset = await MediaLibrary.createAssetAsync(fileUri);
    // const album = await MediaLibrary.getAlbumAsync('Download');
    // if (album == null) {
    //     await MediaLibrary.createAlbumAsync('Download', asset, false);
    // } else {
    //     await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    // }
    // } catch (e) {
    //     console.log("error:",e);
    // }
    const contents = await FileSystem.readAsStringAsync(fileUri,{ encoding: FileSystem.EncodingType.Base64 });
    const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(parentUri, filename, "text/plain");
       await FileSystem.writeAsStringAsync(destinationUri,contents,{encoding: FileSystem.EncodingType.Base64 })
    console.log("copied asset to album:Download");
};

export const saveToFile = async (arrayOfDictionaries:object) => {
    // Create a new file uri
    const formattedDateTime = getFormattedDateTime();
    const filename = "runPositions_" + formattedDateTime + ".txt";
    const parentUri = FileSystem.documentDirectory;
    const fileUri = parentUri + filename;
    console.log("parentUri:", parentUri)
    console.log("filename:", filename)
    console.log("fileUri:", fileUri)
  
    // Convert array to string
    const stringifiedArray = JSON.stringify(arrayOfDictionaries);
  
    try {
      // Write the array to the file
      await FileSystem.writeAsStringAsync(fileUri, stringifiedArray);
      alert(`Array has been saved to: ${fileUri}`);
      await saveAndroidFile(fileUri, filename);

    } catch (error) {
      // If an error occurred, show it
      alert(`An error occurred: ${error}`);
    }
};

const saveAndroidFile = async (fileUri, fileName) => {
    try {
      const fileString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      console.log("fileString:",fileString)
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync("Download");
      console.log("permissions:",permissions)
      if (!permissions.granted) {
        return;
      }

      try {
        await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'text/plain')
          .then(async (uri) => {
            console.log("permissions.directoryUri:",permissions.directoryUri)
            console.log("+++uri:",uri)
            await FileSystem.writeAsStringAsync(uri, fileString, { encoding: FileSystem.EncodingType.Base64 });
            alert('Report Downloaded Successfully')
          })
          .catch((e) => {
          });
      } catch (e) {
        throw new Error(e);
      }

    } catch (err) {
    }
  }