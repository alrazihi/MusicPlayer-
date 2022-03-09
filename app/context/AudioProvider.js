import { Alert, Text, View } from "react-native";
import React, { Component, createContext } from "react";
import * as MediaLiberary from "expo-media-library";
export const AudioContext = createContext();
export class AudioProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      audioFiles: [],
      permissionError: false,
    };
  }
  permissionAllert = () => {
    Alert.alert("Permission required", "This app needs to read audio files! ", [
      {
        text: "I am ready",
        onPress: () => this.getPermission(),
      },
      {
        text: "cancel",
        onPress: () => this.permissionAllert(),
      },
    ]);
  };
  getAudioFiles = async () => {
    let media = await MediaLiberary.getAssetsAsync({
      mediaType: "audio",
    });
    media = await MediaLiberary.getAssetsAsync({
      mediaType: "audio",
      first: media.totalCount,
    });
    this.setState({ ...this.state, audioFiles: media.assets });
  };
  getPermission = async () => {
    // {
    //     "accessPrivileges": "none",
    //     "canAskAgain": true,
    //     "expires": "never",
    //     "granted": false,
    //     "status": "undetermined",
    //   }
    const permission = await MediaLiberary.getPermissionsAsync();
    if (permission.granted) {
      // we want to get all the audio files
      this.getAudioFiles();
    }
    if (!permission.canAskAgain && !permission.granted) {
      this.setState({ ...this.state, permissionError: true });
    }
    if (!permission.granted && permission.canAskAgain) {
      const { status, canAskAgain } =
        await MediaLiberary.requestPermissionsAsync();
      if (status === "denied" && canAskAgain) {
        // we are going to display alert that user must allow permission
        this.permissionAllert();
      }
      if (status === "granted") {
        // we are going to get all audio files
        this.getAudioFiles();
      }
      if (status === "denied" && !canAskAgain) {
        // we want to display some error
        this.setState({ ...this.state, permissionError: true });
      }
    }
  };
  componentDidMount() {
    this.getPermission();
  }
  render() {
    if (this.state.permissionError)
      return (
        <View
          style={{
            container: {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        >
          <Text style={{ fontSize: 25, textAlign: "center", color: "red" }}>
            You must give us permission!
          </Text>
        </View>
      );
    return (
      <AudioContext.Provider value={{ audioFiles: this.state.audioFiles }}>
        {this.props.children}
      </AudioContext.Provider>
    );
  }
}
export default AudioProvider;
