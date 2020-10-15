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
            campgroundIndex: null,
            myTrips: [],
            publicTrips: [],
            thisTrip: {},
            myVisits: [],
            publicVisits: [],
            selectedTrip: null,
            tripSelected: false,
            selectedTripCampgrounds: [],
            showOnlyTrip: true,
            saveDisabled: true
        }
      }


    componentDidMount(){
        this.fetchCampsites()
        this.fetchTrips()
        this.fetchVisits()
    }

    clearMarkers= () => {
        markers.forEach((marker) => marker.remove());
        markers = [];
    }

    fetchTrips = () =>{
        fetch("http://localhost:3001/trips")
        .then(res => res.json())
        .then(trips =>{
            this.getMyTrips(trips)
            this.getPublicTrips(trips)
        })
    }

    getMyTrips = (trips) =>{
        const myTrips = trips.filter(trip =>{
            if(trip.user.id === Number(localStorage.user_id)){
                return trip
            }
        })
        this.setState({
            ...this.state,
            myTrips: myTrips
        })
    }

    getPublicTrips = (trips) =>{
        const publicTrips = trips.filter(trip =>{
            if(trip.is_public === true){
                return trip
            }
        })
        this.setState({
            ...this.state,
            publicTrips: publicTrips
        })
    }

    fetchVisits = () => {
        fetch("http://localhost:3001/visits")
        .then(res => res.json())
        .then(visits =>{
            this.getMyVisits(visits)
            this.getPublicVisits(visits)
        })
    }

    getMyVisits = (visits) =>{
        const myVisits = visits.filter(visit =>{
            if(visit.trip.user_id === Number(localStorage.user_id)){
                return visit
            }
        })
        this.setState({
            ...this.state,
            myVisits: myVisits
        })
    }

    getPublicVisits = (visits) =>{
        const publicVisits = visits.filter(visit =>{
            if(visit.trip.is_public === true){
                return visit
            }
        })
        this.setState({
            ...this.state,
            publicVisits: publicVisits
        })
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

    closeTripDetailWindow = () =>{
        this.setState({
            ...this.state,
            saveDisabled: true,
            tripSelected: false,
            selectedTripCampgrounds: []
        })
    }

    handleLogoutClick = () =>{
        this.props.handleLogOut()
    }

    changeMode = (newMode) =>{
        this.setState({
            ...this.state,
            tripSelected: false,
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
        if(this.state.mode === "explore" || this.state.showOnlyTrip === false){
            this.fetchCampsites()
        }
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
        let campgroundList
        if(this.state.showOnlyTrip === true && (this.state.mode === "browse" || this.state.mode === "myTrips")){
            campgroundList = this.state.selectedTripCampgrounds
        }else{
            campgroundList = this.state.campgrounds.features
        }
        return campgroundList.map((campground, index) => {
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

    handleMyTripClick = (trip) =>{
        this.setState({
            ...this.state,
            selectedTrip: trip
        },
           () => this.getMyTripVisits(trip)
        )
    }

    getMyTripVisits = (trip) =>{
        let campgrounds = []
        this.state.myVisits.forEach(campground =>{
            if(campground.trip_id === trip.id){
                campgrounds.push(
                        {
                            "type": "Feature",
                            "geometry": {
                            "type": "Point",
                            "coordinates": [
                                Number(campground.longitude),
                                Number(campground.latitude)
                            ]
                            },
                            "properties": {
                                "trip_id": campground.trip_id,
                                "id": campground.id,
                                "name": campground.location_name,
                                "description": campground.description,
                                "phone": campground.phone,
                                "reservable": campground.reservable,
                                "email": campground.email,
                                "longitude": Number(campground.longitude),
                                "latitude": Number(campground.latitude)
                            }
                        }
                )
            }
        })
        this.setState({
            ...this.state,
            tripSelected: true,
            selectedTripCampgrounds: campgrounds
        })
    }

    toggleCampsites = () =>{
        if(this.state.showOnlyTrip === true){
            this.fetchCampsites()
        }
        this.setState({
            ...this.state,
            showOnlyTrip: !this.state.showOnlyTrip
        })
    }

    addCampsiteToTrip = () =>{
        this.setState({
            ...this.state,
            saveDisabled: false,
            selectedCampground:{
                ...this.state.selectedCampground,
                properties: {
                    ...this.state.selectedCampground.properties,
                    trip_id: this.state.selectedTrip.id
                }
            }
        },
            () =>{
                let selectedTripCampgrounds = this.state.selectedTripCampgrounds
                selectedTripCampgrounds.push(this.state.selectedCampground)
                this.setState({
                    ...this.state,
                    selectedTripCampgrounds: selectedTripCampgrounds
                })
            }
        )
        
    }

    deleteCampsiteFromTrip = (campgroundToRemove) => {
        let selectedTripCampgrounds = this.state.selectedTripCampgrounds.filter(campground =>{
            if(campground.properties.id !== campgroundToRemove.properties.id){
                return campground
            }
        })
        // console.log(selectedTripCampgrounds)
        setTimeout(()=>{
            this.setState({
                ...this.state,
                saveDisabled: false,
                showDetail: false,
                selectedTripCampgrounds: selectedTripCampgrounds,

            })
        },5)
    }

    updateTrip = (trip) => {
        let myVisitsNew = []
        this.state.myVisits.forEach(visit =>{
            if(visit.trip_id === trip.id){
                this.deleteVisit(visit)
            }else{
                myVisitsNew.push(visit)
            }
        })
        this.setState({
            ...this.state,
            saveDisabled: true
        })
        setTimeout(() =>{
            this.removeFromMyVisit(myVisitsNew)
            this.state.selectedTripCampgrounds.forEach(visit =>{
                this.createVisit(visit)
            })
        },2000)
    }

    deleteVisit = (visit) =>{
        // console.log(visit.id)
        fetch(`http://localhost:3001/visits/${visit.id}`,{
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            // console.log(data)
        })
    }

    removeFromMyVisit = (myVisitsNew) =>{
        this.setState({
            ...this.state,
            saveDisabled: true,
            myVisits: myVisitsNew
        })
    }

    createVisit = (visit) =>{
        // console.log(visit.properties.id)
        const newData = {
            trip_id: visit.properties.trip_id,
            location_name: visit.properties.name,
            latitude: visit.properties.latitude,
            longitude: visit.properties.longitude,
            description: visit.properties.description,
            phone: visit.properties.phone,
            email: visit.properties.email,
            reservable: visit.properties.reservable,
            date_visited: null
        }
        this.updateMyVisits(newData)
        fetch(`http://localhost:3001/visits`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newData)
        })
        .then(res => res.json())
        .then(visit =>{
            // console.log(visit)
        })
    }

    updateMyVisits = (visit) => {
        let myVisits = this.state.myVisits
        myVisits.push(visit)
        this.setState({
            ...this.state,
            myVisits: myVisits
        })
    }

    submitNewTrip = (trip) =>{
        let publicTrips = this.state.publicTrips
        let myTrips = this.state.myTrips
        myTrips.push(trip)
        if(trip.is_public === true){
            publicTrips.push(trip)
        }
        this.setState({
            ...this.state,
            publicTrips: publicTrips,
            myTrips: myTrips
        })
    }

    render(){
        let viewport = this.state.viewport;
        return (
            <div id="map-container" onClick={() => this.handleMapClick()}>
                <div className="nav-bar">
                    <Navbar handleLogOut={this.props.handleLogOut} changeMode={this.changeMode} mode={this.state.mode}/>
                </div>
                {/* <div className="map-search" >
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
                </div> */}
                <div>{this.state.mode === 'browse' ? <BrowseTrips/> : null}</div>
                <div>{this.state.mode === 'myTrips' && this.state.tripSelected === false ? <MyTrips myTrips={this.state.myTrips} 
                                                                handleMyTripClick={this.handleMyTripClick}/> : null}</div>
                <div>{this.state.mode === 'createNew' ? <CreateTrip submitNewTrip={this.submitNewTrip}/> : null}</div>
                <div>{this.state.tripSelected === true && (this.state.mode === 'myTrips' || this.state.mode === 'browse') ? <TripEditor selectedTripCampgrounds={this.state.selectedTripCampgrounds}
                                                                    trip={this.state.selectedTrip} 
                                                                    closeTripDetailWindow={this.closeTripDetailWindow}
                                                                    handleCampgroundClick={this.handleCampgroundClick}
                                                                    handleOnMouseEnter = {this.handleOnMouseEnter}
                                                                    handleOnMouseLeave = {this.handleOnMouseLeave}
                                                                    showOnlyTrip = {this.state.showOnlyTrip}
                                                                    toggleCampsites = {this.toggleCampsites}
                                                                    addCampsiteToTrip = {this.addCampsiteToTrip}
                                                                    deleteCampsiteFromTrip = {this.deleteCampsiteFromTrip}
                                                                    updateTrip = {this.updateTrip}
                                                                    saveDisabled = {this.state.saveDisabled}
                                                                    /> : null}</div>
                <div>{this.state.showDetail === true ? <CampgroundDetails selectedCampground={this.state.selectedCampground} closeDetailWindow={this.closeDetailWindow}/> : null}</div>
            </div>  
        )
    }
}
export default withRouter(Map);