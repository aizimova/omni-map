import React, { Component } from 'react';
import { AppRegistry, View, Dimensions, Button, Text, TouchableOpacity} from 'react-native';
import MapView from 'react-native-maps';
import axios from 'axios';
import { formatDate } from './helpers';
import config from './config.json';
import CheckBox from 'react-native-check-box';
import { MKTextField, MKColor } from 'react-native-material-kit';
import MapViewDirections from 'react-native-maps-directions';
import Communications from 'react-native-communications';
import { styles } from './styles';

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
        showCheckboxes: false,
        showRouteForm: false,
        showLossForm: false,
        lossCoordinates: {
          latitude: LATITUDE,
          longitude: LONGITUDE
        },       
        showFromMarker: false,
        showToMarker: false,
        fromCoordinates: null,
        toCoordinates: null,
        fromSet: false,
        toSet: false,
        fixRegion: false
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

      navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({
            region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            },
            lossCoordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => console.log(error.message),
        {
          enableHighAccuracy: false,
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

    onRegionChange(region) {
      if (this.state.fixRegion) {
        this.setState({ region });
      }
    }

    render() {
      return (
        <View style={ styles.container }>
          <MapView
            style={ styles.map }
            showsUserLocation={ true }
            region={ this.state.region }
            // followsUserLocation= { true }
            onRegionChangeComplete={ this.onRegionChange.bind(this) }
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
            { this.state.showLossForm &&
              <MapView.Marker draggable
                coordinate={ this.state.lossCoordinates }
                onDragEnd={ (e) => this.setState({ 
                  lossCoordinates: e.nativeEvent.coordinate,
                  region: {
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                  }
                }) }
              />
            }
            { this.state.showFromMarker &&
              <MapView.Marker draggable
                coordinate={ this.state.fromCoordinates }
                pinColor="blue"
                onDragEnd={ (e) => this.setState({ 
                  fromCoordinates: e.nativeEvent.coordinate,
                  region: {
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                  }
                }) }
              />
            }
            { this.state.showToMarker &&
              <MapView.Marker draggable
                coordinate={ this.state.toCoordinates }
                pinColor = "green"
                onDragEnd={ (e) => this.setState({ 
                  toCoordinates: e.nativeEvent.coordinate,
                  region: {
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                  }
                })}
              />
            }
            { this.state.toSet &&
              <MapViewDirections
                origin={ this.state.fromCoordinates }
                destination={ this.state.toCoordinates }
                apikey={ config.googleApiKey }
                strokeWidth={ 3 }
                strokeColor="red"
              />
            }
          </MapView>

          <View style={ styles.ButtonContainer }>
            <Button
              color="white"
              title = "Choose crimes"
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
          
          <View style={styles.buttonSos}>
            <Button 
              title="call 102"
              color="white"
              onPress={() => Communications.phonecall('102', true)}
            />
          </View>   
          
          <View style={ styles.routeButton }>
            <Button 
              title="R"
              color="white"
              onPress = { () => this.setState({
                showRouteForm: !this.state.showRouteForm,
                showFromMarker: false,
                showToMarker: false,
                fromSet: false,
                toSet: false
              }) }
            />
            { this.state.showRouteForm &&
              <View style ={ styles.routeForm }>
                  <View style={ styles.buttonFrom }>
                    <Button
                      title={ this.state.showFromMarker ? (this.state.fromSet ? "Saved" : "Set") : "From" }
                      color="white"
                      disabled={ this.state.fromSet ? true : false }
                      onPress={ () => { 
                        if (this.state.showFromMarker) {
                          this.setState({
                            fromSet: true,
                            fixRegion: true
                          });
                        } else {
                          this.setState({
                            fromCoordinates: {
                              latitude: this.state.region.latitude,
                              longitude: this.state.region.longitude
                            },
                            showFromMarker: true
                          });
                        }}
                      }
                    />
                  </View>
                  <View style={ styles.buttonTo }>
                    <Button
                      title={ this.state.showToMarker ? (this.state.toSet ? "Saved" : "Set") : "To" }
                      color= "white"
                      disabled={ this.state.fromSet ? false : true }
                      onPress={ () => { 
                        if (this.state.showToMarker) {
                          this.setState({
                            toSet: true,
                            showRouteForm: false,
                            fixRegion: false
                          });
                        } else {
                          this.setState({
                            toCoordinates: {
                              latitude: this.state.region.latitude,
                              longitude: this.state.region.longitude
                            },
                            showToMarker: true
                          });
                        }}
                      }
                    />
                  </View>
              </View>
            }
          </View>

          <View style={ styles.lossButton }>
            <Button 
              title="L"
              color="white"
              onPress = { () => this.setState({ showLossForm: !this.state.showLossForm }) }
            />
            { this.state.showLossForm &&
              <View style ={ styles.lossForm }>
                <MKTextField
                  tintColor={ MKColor.Lime }
                  textInputStyle={{ color: MKColor.Orange }}
                  placeholder = "Describe in details ..."
                  style={ styles.textField }
                />
                <View style={ styles.buttonLossForm }>
                  <Button
                    title = "upload pic"
                    color = "white"
                    onPress={ () => {} }
                  />
                </View>
                <View style={ styles.buttonSubmit }>
                  <Button
                    title = "submit"
                    color= "white"
                    onPress={ () => {} }
                  />
                </View>
              </View>
            }
          </View>
        </View>
      );
    }
  }

