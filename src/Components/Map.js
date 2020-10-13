import React from 'react';
import { withRouter } from 'react-router';

import Geocoder from 'react-mapbox-gl-geocoder';
import MapGL, { Marker, Popup } from 'react-map-gl';


// import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import BrowseTrips from './BrowseTrips';
import MyTrips from './MyTrips';
import CreateTrip from './CreateTrip';
import CampgroundDetails from './CampgroundDetails';
import TripEditor from './TripEditor';



const API_KEY = '9f0eb16d-c443-452d-aa8c-be4b8259d21f'
const ACCESS_TOKEN = 'pk.eyJ1Ijoia2lyaXJvdGhhIiwiYSI6ImNrZnljd3RwZTFscXYyc3M5M21hYnBzd3cifQ.QtkZoBqO03yMwmf8kyL0Ww'

const mapStyle = {
    width: '100%',
    height: '968px'
}
const params = {
    country: "us"
}


const dummySite = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                -77.034084142948,
                38.909671288923
              ]
            },
            "properties": {
                "name": "a campsite",
                "description": "descrtiption",
                "phone": "867-5309",
                "reservable": false,
                "reservationURL": "",
                "longitude": -77.034084142948,
                "latitude": 38.909671288923
            }
        }
    ]
  }

let markers = []


class Map extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mode: 'explore',
            viewport:{
                longitude: -96,
                latitude: 38,
                zoom: 4},
            campgroundsRaw: [],
            campgrounds: dummySite,
            radius: 20,
            showDetail: false,
            showPopup: false,
            popupLat: null,
            popupLon: null,
            popupName: "",
            selectedCampground: "",
            campgroundIndex: null
        }
      }


    componentDidMount(){
        this.fetchCampsites()
    }

    clearMarkers(){
        markers.forEach((marker) => marker.remove());
        markers = [];
      }

    fetchCampsites = () =>{
        // const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const myproxyurl = "https://morning-waters-34270.herokuapp.com/"
        const url = `https://ridb.recreation.gov/api/v1/facilities?query=Campground&limit=50&longitude=${this.state.viewport.longitude}&latitude=${this.state.viewport.latitude}&radius=0&apikey=${API_KEY}`
            fetch(myproxyurl + url)
            .then(res => res.json())
            .then(campgrounds =>{
                console.log(campgrounds)
                // this.convertToMapObjects(campgrounds)
                this.setState({
                    campgroundsRaw: campgrounds.RECDATA
                },
                () => this.convertToMapObjects()
                )
            })
            .catch(() => console.log("Failed"))
    }

    convertToMapObjects = () => {
        if(this.state.campgroundsRaw){
            let campgroundsFixed = this.state.campgroundsRaw.map(campground =>{
                return(
                        {
                            "type": "Feature",
                            "geometry": {
                            "type": "Point",
                            "coordinates": [
                                campground.FacilityLongitude,
                                campground.FacilityLatitude
                            ]
                            },
                            "properties": {
                                "name": campground.FacilityName,
                                "description": campground.FacilityDescription,
                                "phone": campground.FacilityPhone,
                                "reservable": campground.Reservable,
                                "email": campground.FacilityEmail,
                                "reservationURL": campground.FaciltyReservationURL,
                                "longitude": campground.FacilityLongitude,
                                "latitude": campground.FacilityLatitude
                            }
                        }
                )
            })
            this.setState({
                ...this.state,
                campgrounds:{
                    ...this.state.campgrounds,
                    features: campgroundsFixed
                }
            })
        }
    }

    closeDetailWindow = () =>{
        this.setState({
            ...this.state,
            showDetail: false
        })
    }

    handleLogoutClick = () =>{
        this.props.handleLogOut()
    }

    changeMode = (newMode) =>{
        this.setState({
            ...this.state,
            mode: newMode
        })
    }

    handleCampgroundClick = (campground) =>{
        this.setState({
            ...this.state,
            showDetail: true,
            selectedCampground: campground
        })        
    }

    handleOnMouseEnter = (campground,index) =>{
        this.setState({
            ...this.state,
            showPopup: true,
            popupLat: campground.properties.latitude,
            popupLon: campground.properties.longitude,
            popupName: campground.properties.name,
            campgroundIndex: index
        }        )        
    }

    handleOnMouseLeave = (index) =>{
        this.setState({
            ...this.state,
            showPopup: false,
            popupLat: null,
            popupLon: null,
            popupName: "",
            campgroundIndex: null
        })        
    }

    onViewportChange =(viewport) =>{
        this.setState({...this.state, viewport: viewport})
    }

    handleMapClick = () =>{
        this.fetchCampsites()
    }

    onSelected = (viewport, item) => {
        this.setState({
            ...this.state,
            viewport: {
                latitude: viewport.latitude,
                longitude: viewport.longitude,
                zoom: 9.25
            },
            tempMarker: {
                name: item.place_name,
                longitude: item.center[0],
                latitude: item.center[1]
              }
        },
        () => {
            this.closeDetailWindow()
            setTimeout(this.fetchCampsites(), 1000)
        }
        )
    }

    renderMarkers = () =>{
        return this.state.campgrounds.features.map((campground, index) => {
            return(
                <Marker
                key={index}
                longitude={campground.properties.longitude}
                latitude={campground.properties.latitude}
                >
                <div className="marker" 
                    onClick = {() => {this.handleCampgroundClick(campground)}}
                    onMouseEnter = {() => {this.handleOnMouseEnter(campground, index)}}
                    onMouseLeave = {() => {this.handleOnMouseLeave(index)}}
                    >
                
                </div>
                
              </Marker>
            )
          })
    }

    renderPopup = () =>{
        if(this.state.showPopup && this.state.popupLon && this.state.popupLat){
            return(
                <Popup
                    longitude={this.state.popupLon}
                    latitude={this.state.popupLat}
                    closeButton={false}
                    closeOnClick={false}
                    anchor='bottom-left'
                    offsetLeft={16}
                    offsetTop={12}
                >
                <h3>{this.state.popupName}</h3>
                </Popup>
            )
            }else{
                return null
            }
    }

    render(){
        let viewport = this.state.viewport;
        return (
            <div id="map-container" onClick={() => this.handleMapClick()}>
                <div className="nav-bar">
                    <Navbar handleLogOut={this.props.handleLogOut} changeMode={this.changeMode} mode={this.state.mode}/>
                </div>
                <div className="map-search" >
                    <div className="search-icon"></div>
                    <Geocoder
                        mapboxApiAccessToken={ACCESS_TOKEN}
                        onSelected={this.onSelected}
                        hideOnSelect={true}
                        value=""
                        queryParams={params}
                        zoom={9.25}
                    />
                    </div>
                <div className="map-container">
                <MapGL
                    mapboxApiAccessToken={ACCESS_TOKEN}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                    {...viewport}
                    {...mapStyle}
                    onViewportChange={(viewport) => this.setState({...this.state, viewport: viewport})}
                >
                    {this.renderMarkers()}
                    {this.renderPopup()}
                </MapGL>
                </div>
                <div>{this.state.mode === 'browse' ? <BrowseTrips/> : null}</div>
                <div>{this.state.mode === 'myTrips' ? <MyTrips/> : null}</div>
                <div>{this.state.mode === 'createNew' ? <CreateTrip/> : null}</div>
                <div>{this.state.mode === 'tripEditor' ? <TripEditor/> : null}</div>
                <div>{this.state.showDetail === true ? <CampgroundDetails selectedCampground={this.state.selectedCampground} closeDetailWindow={this.closeDetailWindow}/> : null}</div>
            </div>  
        )
    }
}
export default withRouter(Map);