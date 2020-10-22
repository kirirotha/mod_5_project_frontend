import React from 'react';
import { withRouter } from 'react-router';

// import Mapbox, {Layer, Feature } from 'mapbox'
import Geocoder from 'react-mapbox-gl-geocoder';
import MapGL, { Source, Layer, Marker, Popup} from 'react-map-gl';


// import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import BrowseTrips from './BrowseTrips';
import MyTrips from './MyTrips';
import CreateTrip from './CreateTrip';
import CampgroundDetails from './CampgroundDetails';
import TripEditor from './TripEditor';
import TripDetails from './TripDetails';
import EditAddress from './EditAddress';
import PublicTripDetail from './PublicTripDetail'



const API_KEY = '9f0eb16d-c443-452d-aa8c-be4b8259d21f'
const ACCESS_TOKEN = 'pk.eyJ1Ijoia2lyaXJvdGhhIiwiYSI6ImNrZnljd3RwZTFscXYyc3M5M21hYnBzd3cifQ.QtkZoBqO03yMwmf8kyL0Ww'
const WEATHER_API_KEY = '8193c5cae167d371356300b940e3544b'

const TERRAIN = "mapbox://styles/kirirotha/ckfycxc4q052819nz3nft7p8e"
const SATELLITE= "mapbox://styles/mapbox/satellite-v9"
const RETRO = "mapbox://styles/kirirotha/ckgka6ypb070q19mt0yr1kgwa"

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
            showOnlyTrip: false,
            saveDisabled: true,
            showRoute: false,
            route: {},
            user: {},
            showTripDetails: false,
            weather: {},
            initialCampgrounds: [],
            editUser: false,
            showPublicTripDetail: false
        }
      }


    componentDidMount(){
        this.initialCampgroundFetch()
        this.fetchTrips()
        this.fetchVisits()
        this.fetchUser()
    }

    clearMarkers= () => {
        markers.forEach((marker) => marker.remove());
        markers = [];
    }

    fetchUser = () =>{
        fetch(`http://localhost:3001/users/${Number(localStorage.getItem('user_id'))}`)
        .then(res => res.json())
        .then(user =>{
            console.log(user)
            this.setState({
                ...this.state,
                user: user
            })
        })
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
            }else{
                return null
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
            }else{
                return null
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
            }else{
                return null
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
            }else{
                return null
            }
        })
        this.setState({
            ...this.state,
            publicVisits: publicVisits
        })
    }

    initialCampgroundFetch = () =>{
        const myproxyurl = "https://morning-waters-34270.herokuapp.com/"
        const url = `https://ridb.recreation.gov/api/v1/facilities?query=Campground&limit=50&apikey=${API_KEY}`
            fetch(myproxyurl + url)
            .then(res => res.json())
            .then(campgrounds =>{
                console.log(campgrounds)
                // this.convertToMapObjects(campgrounds)
                this.setState({
                    campgroundsRaw: campgrounds.RECDATA,
                    initialCampgrounds: campgrounds.RECDATA
                },
                () => this.convertToMapObjects()
                )
            })
            .catch(() => console.log("Failed"))
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
                let campgroundsRaw = this.state.initialCampgrounds.concat(campgrounds.RECDATA)
                this.setState({
                    campgroundsRaw: campgroundsRaw
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
            showRoute: false,
            saveDisabled: true,
            tripSelected: false,
            showOnlyTrip: false,
            selectedTripCampgrounds: []
        })
    }

    handleLogoutClick = () =>{
        this.props.handleLogOut()
    }

    changeMode = (newMode) =>{
        if(newMode === 'explore'){
            this.closeTripDetailWindow()
            this.setState({
                ...this.state,
                tripSelected: false,
                showOnlyTrip: false,
                mode: newMode,
                showRoute: false,
                selectedTripCampgrounds: []
            })
        }else{
            this.setState({
                ...this.state,
                tripSelected: false,
                mode: newMode
            })
        }
    }

    handleCampgroundClick = (campground) =>{
        this.setState({
            ...this.state,
            showDetail: true,
            selectedCampground: campground
        },
            () => {this.getWeather()}
        )        
    }

    handleZoom = () =>{
        if(this.state.viewport.zoom < 6){
            let newZoom = 8.75
            let newLat = this.state.selectedCampground.properties.latitude
            let newLng = this.state.selectedCampground.properties.longitude
            this.setState({
                ...this.state,
                viewport:{
                    longitude: newLng,
                    latitude: newLat,
                    zoom: newZoom},
            },
                () => this.fetchCampsites()
            )     
        }   
    }

    getWeather = () =>{
        let lat = this.state.selectedCampground.properties.latitude
        let lon = this.state.selectedCampground.properties.longitude
        let exclude = 'minutely,hourly'
        fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=${exclude}&units=imperial&appid=${WEATHER_API_KEY}`)
        .then(res => res.json())
        .then(data =>{
            console.log(data)
            this.setState({
                ...this.state,
                weather: data
            })
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
        if(this.state.showOnlyTrip !== true){
            campgroundList = this.state.campgrounds.features
            return campgroundList.map((campground, index) => {
                return(
                    <Marker
                    key={index}
                    longitude={campground.properties.longitude}
                    latitude={campground.properties.latitude}
                    offsetLeft={-20}
                    offsetTop={-12}
                    >
                    {campground.properties.name === "Home" ?
                    <div className="house-marker"
                        onClick = {() => {this.handleCampgroundClick(campground)}}
                        onMouseEnter = {() => {this.handleOnMouseEnter(campground, index)}}
                        onMouseLeave = {() => {this.handleOnMouseLeave(index)}}
                        >
                    
                    </div>
                    :
                    <div className="marker"
                        onClick = {() => {this.handleCampgroundClick(campground)}}
                        onMouseEnter = {() => {this.handleOnMouseEnter(campground, index)}}
                        onMouseLeave = {() => {this.handleOnMouseLeave(index)}}
                        >
                    
                    </div>
                    }       
                </Marker>
                )
            })
        }
    }

    renderTripMarkers = () =>{
        let campgroundList
        if(this.state.mode === "browse" || this.state.mode === "myTrips"){
            campgroundList = this.state.selectedTripCampgrounds
            return campgroundList.map((campground, index) => {
                return(
                    <Marker
                    key={index}
                    longitude={campground.properties.longitude}
                    latitude={campground.properties.latitude}
                    offsetLeft={-20}
                    offsetTop={-12}
                    >
                    {campground.properties.name === "Home" ?
                    <div className="house-marker"
                        onClick = {() => {this.handleCampgroundClick(campground)}}
                        onMouseEnter = {() => {this.handleOnMouseEnter(campground, index)}}
                        onMouseLeave = {() => {this.handleOnMouseLeave(index)}}
                        >
                    
                    </div>
                    :
                    <div className="trip-marker"
                        onClick = {() => {this.handleCampgroundClick(campground)}}
                        onMouseEnter = {() => {this.handleOnMouseEnter(campground, index)}}
                        onMouseLeave = {() => {this.handleOnMouseLeave(index)}}
                        >
                    
                    </div>
                    }       
                </Marker>
                )
            })
        }
    }

    renderHouseMarker = () =>{
        let latitude = null
        let longitude = null
        if(this.state.user.home_latitude){
            latitude = Number(this.state.user.home_latitude)
            longitude = Number(this.state.user.home_longitude)
        }
        if (this.state.user.home_latitude){
            return(
                <Marker
                longitude={longitude}
                latitude={latitude}
                offsetLeft={-20}
                offsetTop={-12}
                >
                <div className="house-marker" 
                    onClick = {() => {this.handleHomeClick()}}
                    onMouseEnter = {() => {this.handleOnMouseHomeEnter()}}
                    onMouseLeave = {() => {this.handleOnMouseHomeLeave()}}
                    >
                
                </div>
                
            </Marker>
            )
        }
    }

    handleHomeClick = () =>{
        let home ={
            "type": "Feature",
            "geometry": {
            "type": "Point",
            "coordinates": [
                Number(this.state.user.home_longitude),
                Number(this.state.user.home_latitude)
            ]},
            properties: {description: `${this.state.user.street} <br> ${this.state.user.city}, ${this.state.user.state} ${this.state.user.zip}`,
                latitude: Number(this.state.user.home_latitude),
                longitude: Number(this.state.user.home_longitude),
                name: "Home" }}
        this.setState({
            ...this.state,
            showDetail: true,
            selectedCampground: home
        },
        () => {this.getWeather()}
        )        
    }

    handleOnMouseHomeEnter = () =>{
        this.setState({
            ...this.state,
            showPopup: true,
            popupLat: Number(this.state.user.home_latitude),
            popupLon: Number(this.state.user.home_longitude),
            popupName: "Home",
        }        )        
    }

    handleOnMouseHomeLeave = () =>{
        this.setState({
            ...this.state,
            showPopup: false,
            popupLat: null,
            popupLon: null,
            popupName: "",
            campgroundIndex: null
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
                >
                <h3>{this.state.popupName}</h3>
                </Popup>
            )
            }else{
                return null
            }
    }

    handleMyTripClick = (trip) =>{
        let route
        if(trip.route){
            let tripParsed = trip.route.split('_')
            route = tripParsed.map(leg =>{
                let legSplit = leg.split(',')
                return [Number(legSplit[0]), Number(legSplit[1])]
            })
        }
        this.setState({
            ...this.state,
            route: route,
            showRoute: true,
            selectedTrip: trip,
            showOnlyTrip: true
        },
           () => this.getMyTripVisits(trip)
        )
    }

    handleTripEnter = (trip) =>{
        let route
        if(trip.route){
            let tripParsed = trip.route.split('_')
            route = tripParsed.map(leg =>{
                let legSplit = leg.split(',')
                return [Number(legSplit[0]), Number(legSplit[1])]
            })
        }
        this.setState({
            ...this.state,
            route: route,
            showRoute: true,
            selectedTrip: trip,
            showOnlyTrip: true
        },
        () => this.getMyTripVisitsHover(trip)
        )
    }

    handleTripLeave = () => {
        this.setState({
            ...this.state,
            route: [],
            showRoute: false,
            selectedTripCampgrounds: []
        })
    }

    getMyTripVisitsHover = (trip) =>{
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
                                "stop_number": campground.stop_number,
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
            selectedTripCampgrounds: campgrounds
        },
            () => {
                this.renderMarkers()
                // setTimeout(() => this.sortTripVisits(), 100)
            }
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
                                "stop_number": campground.stop_number,
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
        },
            () => {
                this.renderMarkers()
                // setTimeout(() => this.sortTripVisits(), 100)
            }
        )
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
                    stop_number: this.state.selectedTripCampgrounds.length+1,
                    trip_id: this.state.selectedTrip.id,
                }
            }
        },
            () =>{
                let selectedTripCampgrounds = this.state.selectedTripCampgrounds
                selectedTripCampgrounds.push(this.state.selectedCampground)
                this.setState({
                    ...this.state,
                    selectedTripCampgrounds: selectedTripCampgrounds,
                    showDetail: false
                })
            }
        )
        
    }

    deleteCampsiteFromTrip = (campgroundToRemove) => {
        let selectedTripCampgrounds = this.state.selectedTripCampgrounds.filter(campground =>{
            if(campgroundToRemove.properties.id){
                if(campground.properties.id !== campgroundToRemove.properties.id){
                    return campground
                }else{
                    return null
                }
            }else{
                if(campground.properties.name !== campgroundToRemove.properties.name || campground.properties.latitude !== campgroundToRemove.properties.latitude || campground.properties.longitude !== campgroundToRemove.properties.longitude){
                    return campground
                }else{
                    return null
                }
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
        },50)
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
        let index = 0
        this.state.selectedTripCampgrounds.forEach(visit =>{
            index++
            const newData = {
                stop_number: visit.properties.stop_number,
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
            myVisitsNew.push(newData)
            this.createVisit(visit, index)
        })
        this.setState({
            ...this.state,
            saveDisabled: true,
            showOnlyTrip:   true,
            showPopup: false,
            // myVisits: myVisitsNew
        },
        () =>{
            setTimeout(() =>this.fetchVisits(), 1000)
            this.getDirections()
        }
        )
    }

    deleteVisit = (visit) =>{
        // console.log(visit.id)
        if(visit.id){
            fetch(`http://localhost:3001/visits/${visit.id}`,{
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                // console.log(data)
            })
        }
    }

    // removeFromMyVisit = (myVisitsNew) =>{
    //     this.setState({
    //         ...this.state,
    //         saveDisabled: true,
    //         myVisits: myVisitsNew
    //     })
    // }

    createVisit = (visit) =>{
        // console.log(visit.properties.id)
        const newData = {
            stop_number: visit.properties.stop_number,
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
        // this.updateMyVisits(newData)
        fetch(`http://localhost:3001/visits`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newData)
        })
        .then(res => res.json())
        .then(visit =>{
            console.log(visit)
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
            myTrips: myTrips,
            selectedTrip: trip,
            mode: 'myTrips'
        })
    }

    parseWaypoints = () =>{
        let waypoints = []
        let sortedCampgrounds = this.state.selectedTripCampgrounds.sort((a,b) =>{
            return a.stop_number - b.stop_number
        })
        sortedCampgrounds.forEach(visit =>{
            waypoints.push(`${visit.properties.longitude},${visit.properties.latitude}`)
        })
        return waypoints.join(';')
    }

    getDirections = () =>{
        // let waypoints = `-106.0337898,40.5166418;-114.224196,48.722654`
        let waypoints = this.parseWaypoints()
        if(waypoints !== ""){
            fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${ACCESS_TOKEN}`)
            .then(res => res.json())
            .then(route =>{
                    if(route.routes !== []){
                    this.setState({
                        ...this.state,
                        showRoute: true,
                        route: route.routes[0].geometry.coordinates
                    },
                        () => setTimeout(() =>this.updateRouteInDb(), 100)
                    )
                }
            })
        }else{
            this.setState({
                ...this.state,
                showRoute: true,
                route: []
            },
                () => setTimeout(() =>this.updateRouteInDb(), 100)
            )
        }
    }

    updateRouteInDb = () =>{
        if(this.state.route){
            let patchData
            if(this.state.selectedTripCampgrounds !== []){
                patchData = {
                    route: this.state.route.join('_')
                }
            }else{
                patchData = {
                    route: ""
                }
            }
            fetch(`http://localhost:3001/trips/${this.state.selectedTrip.id}`,{
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(patchData)
            })
            .then(res => res.json())
            .then(trip =>{
                console.log(trip)
                let route
                if(trip.route){
                    let tripParsed = trip.route.split('_')
                    route = tripParsed.map(leg =>{
                        let legSplit = leg.split(',')
                        return [Number(legSplit[0]), Number(legSplit[1])]
                    })
                }
                this.setState({
                    ...this.state,
                    route: route,
                    showRoute: true,
                    selectedTrip: trip
                },
                   () => setTimeout(() => {
                    this.fetchTrips()
                    this.fetchVisits()
                    this.getMyTripVisits(trip)}
                   , 1000)
                )
            })
        }
    }

    renderRoute = () =>{
        if(this.state.route){
            let routeLayer = {
                id: 'route',
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                            type: 'LineString',
                            coordinates: this.state.route
                        }
                }
            }
            return(
                <>
                <Source {...routeLayer}></Source>
                <Layer id='route' type='line' source='route'
                    paint={{'line-width': 5,'line-color': '#3887be', 'line-opacity': .75}}
                    />
                </>
            )
        }
    }

    togglePublicTrip = () =>{
        this.setState({
            ...this.state,
            selectedTrip:{
                ...this.state.selectedTrip,
                is_public: !this.state.selectedTrip.is_public
            }
        },
        () => this.updatePublicTripinDb()
        )
    }

    

    updatePublicTripinDb = () =>{
        let patchData = {is_public: this.state.selectedTrip.is_public}
        fetch(`http://localhost:3001/trips/${this.state.selectedTrip.id}`,{
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(patchData)
            })
            .then(res => res.json())
            .then(trip =>{
                console.log(trip)
                this.fetchTrips()
            })
    }

    deleteTrip = () =>{
        let myTrips = this.state.myTrips.filter(trip =>{
             return this.state.selectedTrip.id !== trip.id
        })
        let publicTrips = this.state.publicTrips.filter(trip =>{
             return this.state.selectedTrip.id !== trip.id
        })
        this.setState({
            showRoute: false,
            saveDisabled: true,
            tripSelected: false,
            showOnlyTrip: false,
            selectedTripCampgrounds: [],
            myTrips: myTrips,
            publicTrips: publicTrips,
            showTripDetails: false
        },
        () => {
            this.deleteTripVisits()
        }
        )
    }

    deleteTripVisits = () =>{
        let visitsToDelete = this.state.myVisits.filter(visit =>{
            return visit.trip_id === this.state.selectedTrip.id
        })
        let visitsToKeep = this.state.myVisits.filter(visit =>{
            return visit.trip_id !== this.state.selectedTrip.id
        })
        visitsToDelete.forEach(visit =>{
            this.deleteVisit(visit)
        })
        this.setState({
            ...this.state,
            myVisits: visitsToKeep
        },
        () => setTimeout(() =>this.deleteTripInDb(), 3000)
        )
    }

    deleteTripInDb = () =>{
        fetch(`http://localhost:3001/trips/${this.state.selectedTrip.id}`,{
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
    }

    
    editAddress = () =>{
        this.setState({
            ...this.state,
            editUser: true
        })
    }

    updateUser = (user) =>{
        this.setState({
            ...this.state,
            user: user
        })
    }

    closeEditAddressWindow = () =>{
        this.setState({
            ...this.state,
            editUser: false
        })
    }

    handlePublicTripClick = (trip) =>{
        console.log('click')
        this.setState({
            ...this.state,
            selectedTrip: trip,
            showPublicTripDetail: true
        })
    }

    closePublicTripDetailWindow = () =>{
        this.setState({
            ...this.state,
            showPublicTripDetail: false,
            showRoute: false,
            saveDisabled: true,
            tripSelected: false,
            showOnlyTrip: false,
            selectedTripCampgrounds: []
        })
    }
    
    addTrip = () =>{
        console.log('adding trip')
        let newTripList = []
        newTripList.push(this.home) 
    }

    render(){
        let viewport = this.state.viewport;
        return (
            <div id="map-container" onClick={() => this.handleMapClick()}>
                <div className="nav-bar">
                    <Navbar handleLogOut={this.props.handleLogOut} changeMode={this.changeMode} mode={this.state.mode}
                    editAddress={this.editAddress}/>
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
                    <MapGL mapboxApiAccessToken={ACCESS_TOKEN}
                        mapStyle={RETRO}
                        {...viewport}
                        {...mapStyle}
                        onViewportChange={(viewport) => this.setState({...this.state, viewport: viewport})}>
                        {this.state.user? this.renderHouseMarker() : null}
                        {this.renderTripMarkers()}
                        {this.renderMarkers()}
                        {this.renderPopup()}
                        {this.state.showRoute ? this.renderRoute() : null}
                    </MapGL>
                </div>
                <div>{this.state.mode === 'browse' && this.state.showPublicTripDetail === false ? <BrowseTrips publicTrips={this.state.publicTrips}
                                                                handlePublicTripClick={this.handlePublicTripClick}
                                                                handleTripEnter={this.handleTripEnter}
                                                                handleTripLeave={this.handleTripLeave}
                                                                /> : null}</div>
                <div>{this.state.mode === 'myTrips' && this.state.tripSelected === false ? <MyTrips myTrips={this.state.myTrips} 
                                                                handleMyTripClick={this.handleMyTripClick}
                                                                handleTripEnter={this.handleTripEnter}
                                                                handleTripLeave={this.handleTripLeave} /> : null}</div>
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
                                                                    showDetail = {this.state.showDetail}
                                                                    togglePublicTrip={this.togglePublicTrip}
                                                                    deleteTrip={this.deleteTrip}
                                                                    /> : null}</div>
                <div>{this.state.showDetail === true ? <CampgroundDetails selectedCampground={this.state.selectedCampground}
                                                                    handleOnMouseEnter={this.handleOnMouseEnter}
                                                                    handleOnMouseLeave={this.handleOnMouseLeave}
                                                                    closeDetailWindow={this.closeDetailWindow}
                                                                    weather={this.state.weather}
                                                                    /> : null}</div>
                <div>{this.state.showTripDetails === true ? <TripDetails selectedTrip={this.state.selectedTrip} closeTripDetailWindow={this.closeTripDetailWindow}/> : null}</div>
                <div>{this.state.editUser ? <EditAddress updateUser={this.updateUser} 
                                                        user={this.state.user}
                                                        closeEditAddressWindow={this.closeEditAddressWindow}
                                                        /> : null}</div>
                <div>{this.state.showPublicTripDetail && this.state.mode === "browse" ? <PublicTripDetail selectedTripCampgrounds={this.state.selectedTripCampgrounds}
                                                                    trip={this.state.selectedTrip} handleOnMouseEnter={this.handleOnMouseEnter}
                                                                    handleOnMouseLeave={this.handleOnMouseHomeLeave} handleCampgroundClick={this.handleCampgroundClick}
                                                                    closePublicTripDetailWindow={this.closePublicTripDetailWindow} addTrip={this.addTrip}
                                                                    /> : null}</div>
            </div>  
        )
    }
}
export default withRouter(Map);