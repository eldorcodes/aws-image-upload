import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import Amplify,{ Storage } from 'aws-amplify';
import awsconfig from './src/aws-exports';
Amplify.configure(awsconfig);

export default function App() {
  const [selectedImage, setSelectedImage] = React.useState(null);

  ///// upload image ////
  const fetchImageUri = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  }
  const uploadFile = async (file) => {
    const img = await fetchImageUri(file.uri);
    return Storage.put(`my-image-filename${Math.random()}.jpg`,img, {
      level:'public',
      contentType:file.type,
      progressCallback(uploadProgress){
        console.log('PROGRESS--', uploadProgress.loaded + '/' + uploadProgress.total);
      }
    })
    .then((res) => {
      Storage.get(res.key)
      .then((result) => {
        console.log('RESULT --- ', result);
        let awsImageUri = result.substring(0,result.indexOf('?'))
        console.log('RESULT AFTER REMOVED URI --', awsImageUri)
      })
      .catch(e => {
        console.log(e);
      })
    }).catch(e => {
      console.log(e);
    })
  }
  ////end upload img ////

  let openImagePickerAsync = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync();
    if (pickerResult.cancelled === true) {
      return;
    }
    console.log(pickerResult);
    uploadFile(pickerResult)
    setSelectedImage({ localUri: pickerResult.uri });
  };

  if (selectedImage !== null) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: selectedImage.localUri }}
          style={styles.thumbnail}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <Image source={{ uri: 'https://i.imgur.com/TkIrScD.png' }} style={styles.logo} />
    <Text style={styles.instructions}>
      To share a photo from your phone with a friend, just press the button below!
    </Text>
    <TouchableOpacity onPress={openImagePickerAsync} style={styles.button}>
      <Text style={styles.buttonText}>Pick a photo</Text>
    </TouchableOpacity>
  </View>
  );
}

const styles = StyleSheet.create({
  /* Other styles hidden to keep the example brief... */
  thumbnail: {
    width: 300,
    height: 300,
    resizeMode: "contain"
  },
  container:{
    flex:1,
    justifyContent:'center'
  },
  button:{
    backgroundColor:'blue',
    padding:5,
    margin:20,
    borderRadius:30
  },
  buttonText:{
    color:'#fff',
    textAlign:'center',
    fontSize:18
  }
});