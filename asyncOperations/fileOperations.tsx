import * as FileSystem from "expo-file-system";
const { StorageAccessFramework } = FileSystem;

export const getFormattedDateTime = (disp_type?: string): string => {
  const date = new Date();

  if (disp_type === 'dateclock') {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}${month} ${hours}:${minutes}`;
  }
  else if (disp_type === 'onlyclock') {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }   else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }
};

export const getReadableDuration = (duration: number) => {
  if (duration === Infinity)
    return "-";
  const seconds = Math.floor(duration / 1000) % 60;
  const minutes = Math.floor(duration / 1000 / 60) % 60;
  const hours = Math.floor(duration / 1000 / 60 / 60);

  const hoursStr = hours > 0 ? `${hours}h` : "";
  const minutesStr =
    minutes > 0
      ? hours > 0
        ? `${String(minutes).padStart(2, "0")}'`
        : `${minutes}'`
      : "";
  const secondsStr =
    hours > 0 || minutes > 0
      ? `${String(seconds).padStart(2, "0")}''`
      : `${seconds}''`;
  //console.log("hoursStr:", hoursStr, "minutesStr:", minutesStr, "secondsStr:", secondsStr, "duration:", duration);
  return hoursStr + minutesStr + secondsStr;
};

const saveToMediaLibrary = async (
  fileUri: string,
  parentUri: string,
  filename: string
) => {
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
  const contents = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const destinationUri =
    await FileSystem.StorageAccessFramework.createFileAsync(
      parentUri,
      filename,
      "text/plain"
    );
  await FileSystem.writeAsStringAsync(destinationUri, contents, {
    encoding: FileSystem.EncodingType.Base64,
  });
  console.log("copied asset to album:Download");
};

export const saveToFile = async (dictionary_to_save:object, filename:string = undefined, fileUri:string = undefined) => {
  // Create a new file uri if filename and fileUri are not provided
  if (filename === undefined && fileUri === undefined) {
    const formattedDateTime = getFormattedDateTime();
    filename = "runPositions_" + formattedDateTime + ".txt";
    const parentUri = FileSystem.documentDirectory;
    fileUri = parentUri + filename;
    console.log("parentUri:", parentUri);
    console.log("filename:", filename);
    console.log("fileUri:", fileUri);
  }

  // Convert dictionary to string
  const stringifiedDictionary = JSON.stringify(dictionary_to_save);

  try {
    // Write the dictionary to the file
    await FileSystem.writeAsStringAsync(fileUri, stringifiedDictionary);
    alert(`Dictionary has been saved to: ${fileUri}`);
    await saveAndroidFile(fileUri, filename);
  } catch (error) {
    // If an error occurred, show it
    alert(`An error occurred: ${error}`);
  }
};

export const saveToFile_multiple = async (arrayOfDictionaries: object[][], asJSON:boolean=false) => {
  try {
    const parentUri = FileSystem.documentDirectory;
    const formattedDateTime = getFormattedDateTime();

    for (let i = 0; i < arrayOfDictionaries.length; i++) {
      const dictionary_to_save = arrayOfDictionaries[i];
      const filename = `runPositions_${formattedDateTime}_${i + 1}.${asJSON ? 'json' : 'txt'}`;
      const fileUri = parentUri + filename;
      console.log("save:", filename, " of dict with len:", dictionary_to_save?.length, asJSON ? 'json' : 'txt');
      console.log("dictionary_to_save:", dictionary_to_save);
      asJSON ? await saveToJson(dictionary_to_save, filename, fileUri) : await saveToFile(dictionary_to_save, filename, fileUri);
    }
    alert(arrayOfDictionaries.length.toFixed(0) + " files have been saved successfully.");
  } catch (error) {
    // If an error occurred, show it
    alert(`An error occurred: ${error}`);
  }
};

const saveToJson = async (arrayOfDicts: object[], filename: string = undefined, fileUri: string = undefined) => {
  // Create a new file uri if filename and fileUri are not provided
  if (filename === undefined && fileUri === undefined) {
    const formattedDateTime = getFormattedDateTime();
    filename = `runPositions_${formattedDateTime}.json`;
    const parentUri = FileSystem.documentDirectory;
    fileUri = parentUri + filename;
    console.log("parentUri:", parentUri);
    console.log("filename:", filename);
    console.log("fileUri:", fileUri);
  }

  console.log("saveToJson - filename:", filename);

  // Convert the array of dictionaries to string
  const stringifiedData = JSON.stringify(arrayOfDicts);

  try {
    // Write the data to the file
    await FileSystem.writeAsStringAsync(fileUri, stringifiedData);
    alert(`Data has been saved as JSON to: ${fileUri}`);
    await saveAndroidFile(fileUri, filename);
  } catch (error) {
    // If an error occurred, show it
    alert(`An error occurred: ${error}`);
  }
};

const saveAndroidFile = async (fileUri, fileName) => {
  try {
    const fileString = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const permissions =
      await StorageAccessFramework.requestDirectoryPermissionsAsync("Download");
    if (!permissions.granted) {
      return;
    }
    console.log("saveAndroidFile-permissions2:", permissions);
    try {
      console.log("saveAndroidFile-fileName:", fileName);
      const mimeType = fileName.endsWith('.json') ? 'application/json' : 'text/plain';
      console.log("saveAndroidFile-mimeType:", mimeType);
      await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        mimeType
      )
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, fileString, {
            encoding: FileSystem.EncodingType.Base64,
          });
          alert("Report Downloaded Successfully");
        })
        .catch((e) => {
          alert("Report Could not be downloaded :(");
        });
    } catch (e) {
      throw new Error(e);
    }
  } catch (err) {}
};
