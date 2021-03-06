import React from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { getResultFromApi } from '../api/googleVision';
import uuid4 from "uuid4";
import * as firebase from 'firebase';
import ApiKeys from '../config/Firebase';

class ResultScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            result: undefined, 
            isLoading: true
        }
        if (!firebase.apps.length) {firebase.initializeApp(ApiKeys.FirebaseConfig); }
      }
      
      componentDidMount() {
        getResultFromApi(this.props.navigation.state.params.base).then(data => {
            for (const label of data.responses[0].labelAnnotations) {
              if (label.description === 'Apple') {
                this.setState({
                  result: label.description,                   
                })
              }
            }
            let pathName = this.props.navigation.state.params.photo;
            let imageName = pathName.split('/');
          
              this.uploadImage(this.props.navigation.state.params.photo, imageName[14])
              .then(() => {
                this.state.result === 'Apple' ? Alert.alert("Retrouvez cette photo dans l'onglet POMME en actualisant") : Alert.alert("Retrouvez cette photo dans l'onglet POUBELLE en actualisant");
              })
              .catch((error) => {
                console.log(error);
              });
              this.storeImage(this.props.navigation.state.params.photo, imageName[14])
            this.setState({
                isLoading: false
              })
        })
      }

      storeImage = async (uri, photoName) => {
        var id = uuid4();
        const uploadData = {
        id: id,
        photoPath: uri,
        photoName: photoName, 
        date: new Date()
        }
        if (this.state.result === 'Apple'){
          return firebase
          .firestore()
          .collection('Success')
          .doc(id)
          .set(uploadData)
        }
        else{
          return firebase
          .firestore()
          .collection('Unknown')
          .doc(uploadData.photoName)
          .set(uploadData)
        }
      }

      uploadImage = async (uri, imageName) => {
        const response = await fetch(uri);
        const blob = await response.blob();

        if (this.state.result === 'Apple'){
          var ref = firebase.storage().ref().child("success/" + imageName);
        }
        else{
          var ref = firebase.storage().ref().child("error/" + imageName);
        }
        return ref.put(blob);
      }

      displayLoading() {
        if (this.state.isLoading) {
          return (
            <View style={styles.loading_container}>
              <ActivityIndicator size='large' />
            </View>
          )
        }
      }

      displayCamera = () => {
        this.props.navigation.navigate('CameraScreen');
    }
    

      displayResult(){
        const { result } = this.state
        if (result != undefined) {
          return (
              <View style={styles.main_container_apple}>
                <View style={{flex: 3, justifyContent: 'center'}}>
                    <Text style={styles.text_result}>C'est une pomme</Text>
                  </View>
                  <View style={styles.containerButton}>
                  <TouchableOpacity 
                    style={styles.button}
                    onPress={() => this.displayCamera()}>
                        <Text style={styles.textButton}>Reprendre une photo</Text>
                    </TouchableOpacity>
                  </View>
              </View>

          )
        }
        else {
            return (
                <View style={[styles.main_container_error]}>
                  <View style={{flex: 3, justifyContent: 'center'}}>
                    <Text style={styles.text_result}>Ce n'est pas une pomme</Text>
                  </View>
                  <View style={styles.containerButton}>
                  <TouchableOpacity 
                    style={styles.button}
                    onPress={() => this.displayCamera()}>
                        <Text style={styles.textButton}>Reprendre une photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>
            )
        }
      }

      render() {
        return (
          <View style={styles.main_container}>
            {this.displayLoading()}
            {!this.state.isLoading ? this.displayResult() : null}
          </View>
        )
      }
}

const styles = StyleSheet.create({
    main_container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    main_container_apple: {
        flex: 1,
        width : '100%',
        justifyContent: 'center',
        backgroundColor: '#2e7d32',
      },
      main_container_error: {
        flex: 1,
        width : '100%',
        justifyContent: 'center',
        backgroundColor: '#d32f2f'
      },
    loading_container: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center'
    },
    text_result: {
        fontSize: 60,
        fontFamily: 'Futura',
        color: '#FFFFFF',
        textAlign: 'center'
    },
    containerButton:{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
  },
  button: {
      alignItems: "center",
      backgroundColor: "#DDDDDD",
      padding: 20,
  },
  textButton:{
    fontSize: 20,
    fontFamily: 'Futura',
}
  })

  
export default ResultScreen;
