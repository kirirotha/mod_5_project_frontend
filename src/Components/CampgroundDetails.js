import React from 'react';

class CampgroundDetails extends React.Component{
    renderDetails = () =>{
        window.scroll(0,0)
        return {__html: this.props.selectedCampground.properties.description}
    }

    handleCloseClick = () =>{
        this.props.closeDetailWindow()
    }

    render(){
        return(
            <div className="trip-panel">
                <div className="close-button" onClick={this.handleCloseClick}>x</div>
                <div className="trip-panel-title"> 
                    <h1>{this.props.selectedCampground.properties.name}</h1> 
                </div>
                <div className="campground-details" dangerouslySetInnerHTML={this.renderDetails()}></div>
                <div className="campground-info">
                    <div className="info-line">
                        <h3>Phone:</h3>
                        <p>{this.props.selectedCampground.properties.phone ? this.props.selectedCampground.properties.phone : null}</p>
                    </div>
                    <div className="info-line">
                        <h3>Email:</h3>
                        <p>{this.props.selectedCampground.properties.email ? this.props.selectedCampground.properties.email : null}</p>
                    </div>
                    <div className="info-line">
                        <h3>Reservable:</h3>
                        <p>{this.props.selectedCampground.properties.reservable ? "Yes" : "No"}</p> 
                    </div>
                </div>
            </div>
        )
    }
}
export default CampgroundDetails;