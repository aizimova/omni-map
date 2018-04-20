import React from 'react';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  routeButton: {
    height: 50,
    width: 50,
    marginRight: 300,
    marginTop: 30,
    marginLeft:20,
    padding: 3,
    backgroundColor: '#43ACC2',
    borderRadius: 30
  },
  lossButton: {
    height: 50,
    width: 50,
    marginRight: 300,
    marginTop: 15,
    marginLeft: 20,
    padding: 3,
    backgroundColor: '#43ACC2',
    borderRadius: 30
  },
  textField: {
    height: 95,
    margin: 20,
    width: 250
  },
  CheckBox: {
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10,
    margin: 0,
    position: 'relative'
  },
  ButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: 150,
    backgroundColor:'#02C391',
    borderRadius: 10
  },
  Checkboxes: {
    backgroundColor: '#FFF',
    marginTop: 10,
    borderRadius: 5
  },
  routeForm: {
    position: 'relative',
    width: 375,
    height: 70,
    backgroundColor: "white",
    marginTop: 485
  },
  lossForm: {
    position: 'relative',
    width: 300,
    height: 120,
    backgroundColor: "white",
    zIndex: 2,
    marginTop: 15
  },
  buttonLossForm: {
    position: 'absolute',
    width: '40%',
    margin: 10,
    height: 40,
    bottom: 10,
    backgroundColor: "#02C391",
    borderRadius:40
  },
  buttonSubmit: {
    position:'absolute',
    width: '30%',
    margin: 10,
    height: 40,
    bottom: 10,
    right: 10,
    backgroundColor: "#43ACC2",
    borderRadius:40
  },
  buttonFrom: {
    width: '30%',
    margin: 20,
    height: 40,
    position: 'absolute',
    backgroundColor: "#43ACC2",
    borderRadius:40
  },
  buttonTo: {
    position:'absolute',
    margin: 20,
    height: 40,
    width: '30%',
    right: 10,
    backgroundColor: "#02C391",
    borderRadius:40
  },
  buttonSos: {
    width: '100%',
    margin: 0,
    height: 40,
    bottom: 0,
    position: 'absolute',
    backgroundColor: "#C76161"
  }
});