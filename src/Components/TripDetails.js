import React from 'react';

class TripDetails extends React.Component{
    
    handleCloseClick = () =>{
        this.props.closeTripDetailWindow()
    }

    render(){
        return(
            <div className="detail-panel">
                <div className="close-button" onClick={this.handleCloseClick}>x</div>
                <div className="detail-panel-title"> 
                    <h1>{this.props.selectedTrip.title}</h1> 
                </div>
                <div className="campground-details">
                    {this.selectedTrip.description}
                </div>
                <div className="campground-info">
                    
                </div>
            </div>
        )
    }
}
export default TripDetails;