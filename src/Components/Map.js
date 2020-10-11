import React from 'react';
import { withRouter } from 'react-router';
// import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import BrowseTrips from './BrowseTrips';
import MyTrips from './MyTrips';
import CreateTrip from './CreateTrip';

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
            lng: -96,
            lat: 38,
            zoom: 4,
            campgroundsRaw: [],
            campgrounds: dummySite,
            radius: 2000
        }
      }


    componentDidMount(){
        this.renderMap()
        this.fetchCampsites()

    }
    
    renderMap = () =>{
        const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
        mapboxgl.accessToken = 'pk.eyJ1Ijoia2lyaXJvdGhhIiwiYSI6ImNrZnljd3RwZTFscXYyc3M5M21hYnBzd3cifQ.QtkZoBqO03yMwmf8kyL0Ww';
        let campgrounds = this.state.campgrounds

        let map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom
            });

        map.on('move', () => {
            const { lng, lat } = map.getCenter();
            this.setState({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            },
            ()=>{
                // map.getSource('campgrounds').setData(this.state.campgrounds)
                this.clearMarkers();
                this.state.campgrounds.features.forEach(function(marker) {

                    // create a HTML element for each feature
                    let el = document.createElement('div');
                    el.className = 'marker';
                  
                    // make a marker for each feature and add to the map
                    let thisMarker = new mapboxgl.Marker(el)
                      .setLngLat(marker.geometry.coordinates)
                      .addTo(map);
                    markers.push(thisMarker)
                  });
            }
            );
            
        });

        


        // map.on('load', function (e) {
        //     map.addSource('campgrounds',{
        //         "type": "geojson",
        //         "data": campgrounds
        //         })

        //     map.loadImage(Tent, function(error, image) {
        //             if (error) throw error;
        //             map.addImage("image", image, {
        //                 "sdf": "true"
        //             });
                
                
        //         map.addLayer({
        //             "id": "locations",
        //             "type": "symbol",
        //             /* Add a GeoJSON source containing place coordinates and information. */
        //             "source": 'campgrounds',
        //             "layout": {
        //             "icon-image": "image",
        //             "icon-allow-overlap": true,
        //             "icon-size": 0.25
        //             },
        //             "paint": {
        //                 "icon-color": "#black",
        //                 "icon-halo-color": "#fff",
        //                 "icon-halo-width": 2
        //             }
        //         });
        //     });
        
        // });
        
        // var timer = window.setInterval(() => {
        //     campgrounds = this.state.campgrounds
        //     map.getSource("campgrounds").setData(campgrounds)
        // }, 1000);
        
    }

    clearMarkers(){
        markers.forEach((marker) => marker.remove());
        markers = [];
      }

    fetchCampsites = () =>{
        const API_KEY = '9f0eb16d-c443-452d-aa8c-be4b8259d21f'
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const url = `https://ridb.recreation.gov/api/v1/facilities?query=Campground&limit=50&longitude=${this.state.lng}&latitude=${this.state.lat}&radius=0&apikey=${API_KEY}`
        fetch(proxyurl + url)
        .then(res => res.json())
        .then(campgrounds =>{
            // console.log(campgrounds)
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

    handleLogoutClick = () =>{
        this.props.handleLogOut()
    }

    changeMode = (newMode) =>{
        this.setState({
            ...this.state,
            mode: newMode
        })
    }

    render(){
        return (
            <div id="map-container">
                <div className="nav-bar">
                    <Navbar handleLogOut={this.props.handleLogOut} changeMode={this.changeMode} mode={this.state.mode}/>
                </div>
                <div className='map' id='map'onMouseUp={() => this.fetchCampsites()}/>
                <div>{this.state.mode === 'browse' ? <BrowseTrips/> : null}</div>
                <div>{this.state.mode === 'myTrips' ? <MyTrips/> : null}</div>
                <div>{this.state.mode === 'createNew' ? <CreateTrip/> : null}</div>
            </div>  
        )
    }
}
export default withRouter(Map);