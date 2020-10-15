import React from 'react';

class TripEditor extends React.Component{


    handleCloseClick = () =>{
        this.props.closeTripDetailWindow()
    }

    handleClick = (campground) =>{
        this.props.handleCampgroundClick(campground)
    }

    handleEnter = (campground, index) =>{
        this.props.handleOnMouseEnter(campground, index)
    }

    handleLeave = (index) => {
        this.props.handleOnMouseLeave(index)
    }

    handleSaveClick = () =>{
        this.props.updateTrip(this.props.trip)
    }

    handleAddClick = () =>{
        this.props.addCampsiteToTrip()
    }

    handleDeleteClick = (campground) =>{
        this.props.deleteCampsiteFromTrip(campground)
    }

    handleToggleClick = () =>{
        this.props.toggleCampsites()
    }

    renderVisits = () =>{
        let index = 0
            return this.props.selectedTripCampgrounds.map(campground =>{
                index ++
                return(
                    <div key={index}>
                        <div className="visit" key={index} 
                            // onClick={() => this.handleClick(campground)}
                            onMouseEnter = {() => {this.handleEnter(campground, index)}}
                            onMouseLeave = {() => {this.handleLeave(index)}}
                            >
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <h4 style={{margin: '0px'}}>{`Stop ${index}`}</h4>
                                <div className="delete-button" onClick={() => this.handleDeleteClick(campground)}>x</div>
                            </div>
                            <h3>{campground.properties.name}</h3>
                            <p>{`Latitude: ${Math.round(campground.properties.latitude * 100000) / 100000}    Longitude: ${Math.round(campground.properties.longitude * 100000)/100000}`} </p>
                        </div>
                    </div>
                )
            })
        
    }

    render(){
        return(
            <div className="trip-panel">
                <div className="close-button" onClick={this.handleCloseClick}>x</div>
                <div className="trip-panel-title"> 
                    <h1>{this.props.trip.title}</h1> 
                </div>
                <div className="trip-list">
                    {this.renderVisits()}
                </div>
                <div className="trip-control-panel">
                    <button id="save" onClick={this.handleSaveClick} disabled={this.props.saveDisabled ? true : false}>Save Trip Changes</button>
                    <button id="add-campsite" onClick={this.handleAddClick}>Add Selected Campsite</button>
                </div>
                <div className="toggle-view">
                    <button id="toggle-camp-render" 
                            onClick={this.handleToggleClick}>
                                {this.props.showOnlyTrip ? "Explore All Campsites" : "Show only Trip Campsites"}
                    </button>
                </div>
            </div>
        )
    }
}
export default TripEditor;