import React, { Component } from 'react';
import { AppRegistry, StyleSheet, View, Dimensions, Picker } from 'react-native';
import MapView from 'react-native-maps';
import axios from 'axios';
import { formatDate } from './helpers';

let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE = 0;
const LONGITUDE = 0;
const LATITUDE_DELTA = 0.0124;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class MapExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      markers: [],
      articles: [],
      currentArticle: ''
    };
  }

  componentDidMount() {
    axios.get('http://192.168.102.96:3000/api/articles')
    .then(res => {
      let articles = res.data;
      this.setState({ articles });
    }).catch(err => {
      console.error(err);
    });
  }

  componentWillMount() {   
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        });
      },
      (error) => console.log(error.message),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );
    this.watchID = navigator.geolocation.watchPosition(
      position => {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
        });
      }
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  changeArticle(value) {
    this.setState({ currentArticle: value });
    let filter = JSON.stringify({
      where: {
        article: value
      }
    });
    axios.get('http://192.168.102.96:3000/api/crimes?filter=' + filter)
    .then(res => {
      let markers = res.data;
      markers.forEach((item, i) => {
        let crimeArticle = item.article;
        let catalogArticle = this.state.articles.find(a => a.code === value);
        if (catalogArticle) {
          item.title = catalogArticle.name;
          item.date = formatDate(item.crime_date);
          item.color = catalogArticle.color;
        } else {
          item.title = '';
          item.date = '';
          item.color = 'red';
        }
      });
      this.setState({ markers });
    }).catch(e => {
      console.error(e);
    });
  }
  
  render() {
    return (
      <View style={ styles.container }>
        <MapView
          style={ styles.map }
          showsUserLocation={ true }
          region={ this.state.region }
          followsUserLocation= { true } 
        >
          { this.state.markers.map((marker, ind) => {
            return (
              <MapView.Marker 
                coordinate={{
                  latitude: marker.lat,
                  longitude: marker.lon
                }}
                title={ marker.title }
                description={ marker.date }
                pinColor={ marker.color }
                key={ ind }
              />
            )
          })}
        </MapView>
        <Picker
          selectedValue={ this.state.currentArticle }
          onValueChange={ value => this.changeArticle(value) }
        >
          <Picker.Item label="Выберите тип преступления" value="" />
          { this.state.articles.map((item, ind) => (
            <Picker.Item
              label={ `${item.name} (${item.code})` }
              value={ item.code }
              key={ ind }
            />
          )) }
        </Picker>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});