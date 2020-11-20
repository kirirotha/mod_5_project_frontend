import React from 'react';

class PublicTripDetail extends React.Component{
    state={
    }


    handleCloseClick = () =>{
        this.props.closePublicTripDetailWindow()
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

    handleAddClick = () =>{
        this.props.addTrip()
    }

    renderVisits = () =>{
        let index = 0
        let sortedCampgrounds = this.props.selectedTripCampgrounds.sort((a,b) =>{
            return a.properties.stop_number - b.properties.stop_number
        })
            return sortedCampgrounds.map(campground =>{
                index ++
                return(
                    <div key={index}>
                        <div className="visit" key={index} 
                            onClick={() => this.handleClick(campground)}
                            onMouseEnter = {() => {this.handleEnter(campground, index)}}
                            onMouseLeave = {() => {this.handleLeave(index)}}
                            >
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <h4 style={{margin: '0px'}}>{`Stop ${index}`}</h4>
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
                    <p>{this.props.trip.is_public ? "Public" : "Private"}</p>
                </div>
                <div className="trip-list">
                    {this.renderVisits()}
                </div>
                <div className="toggle-view">
                    <button id="toggle-camp-render" 
                            onClick={this.handleAddClick}
                            disabled={this.props.trip.user_id === Number(localStorage.getItem('user_id')) ? true : false}>
                                Add to My Trips
                    </button>
                </div>
            </div>
        )
    }
}
export default PublicTripDetail;