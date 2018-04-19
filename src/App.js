import React, { Component } from 'react';
import { AppRegistry, StyleSheet, View, Dimensions, Button, Text} from 'react-native';
import MapView from 'react-native-maps';
import axios from 'axios';
import { formatDate } from './helpers';
import config from './config.json';
import CheckBox from 'react-native-check-box';
import MapContainer from './components/MapContainer/index';



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
      checkedArticles: [],
      showCheckboxes: false
    };
  }

  componentDidMount() {
    axios.get(`${config.backend}/articles`)
    .then(res => {
      let allArticles = res.data;
      let articles = [];
      allArticles.forEach(item => {
        let article = articles.find(a => a.name === item.name);
        if (article) {
          article.codes.push(item.code);
        } else {
          articles.push({
            name: item.name,
            codes: [item.code],
            color: item.color
          });
        }
      })
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

  clickArticle(article) {
    let newArticles = this.state.checkedArticles;
    let ind = this.state.checkedArticles.indexOf(article);
    if (ind >= 0) {
      newArticles.splice(ind, 1);
    } else {
      newArticles.push(article);
    }
    this.setState({ checkedArticles: newArticles });
    if (newArticles.length > 0) {
      jsonValue = []
      newArticles.forEach(art => {
        art.codes.forEach(code => jsonValue.push({
          article: code
        }));
        let filter = JSON.stringify({
          where: {
            or: jsonValue
          }
        });
        axios.get(`${config.backend}/crimes?filter=${filter}`)
        .then(res => {
          let markers = res.data;
          markers.forEach((item, i) => {
            let catalogArticle = this.state.articles.find(a => a.codes.indexOf(item.article) >= 0);
            if (catalogArticle) {
              item.title = catalogArticle.name;
              item.date = formatDate(item.crime_date);
              item.color = catalogArticle.color;
            } else {
              item.title = '';
              item.date = '';
              item.color = '#2E8B57';
            }
          });
          this.setState({ markers });
        }).catch(e => {
          console.error(e);
        });
      });
    } else {
      this.setState({ markers: [] });
    }
  }

  Press = () => {
    this.state.articles.map((item, ind) => (
      <CheckBox
        style={ styles.CheckBox }
        onClick={ () => this.clickArticle(item) }
        isChecked={ !!this.state.checkedArticles.find(a => a === item) }
        leftText={ item.name }
        key={ ind }
      />
    ))
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
         
        <View style={ styles.ButtonContainer }>
          <Button
            color="white"
            title = "Crime Types"
            onPress = { () => this.setState({ showCheckboxes: !this.state.showCheckboxes }) }
          />
          { this.state.showCheckboxes && 
            <View style={ styles.Checkboxes }>
              { this.state.articles.map((item, ind) => (
                <CheckBox
                  style={ styles.CheckBox }
                  onClick={ () => this.clickArticle(item) }
                  isChecked={ !!this.state.checkedArticles.find(a => a === item) }
                  leftText={ item.name }
                  leftTextStyle = { {color:'#39CCCC', fontSize: 15} }
                  key={ ind }
                />
              )) }
            </View>
          }
        </View>
        <MapContainer />
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
    backgroundColor:'#39CCCC',
    borderRadius: 8
  },
  Checkboxes: {
    backgroundColor: '#FFF',
    marginTop: 10,
    borderRadius: 5
  }
  // ButtonSOS:{
  //   backgroundColor: 'red',
  //   height: 20,
  //   width: 20,
  //   marginLeft: 150

  // }

});