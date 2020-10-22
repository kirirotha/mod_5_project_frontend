import React from 'react';

class BrowseTrips extends React.Component{

    renderTrip = ()=>{
        return this.props.publicTrips.map(trip =>{
            return(
                <div className='trip' onClick={() => this.handleClick(trip)}
                                        onMouseEnter={() => this.handleMouseEnter(trip)}
                                        onMouseLeave={() => this.handleMouseLeave()} key={trip.id}>
                    <h3>{trip.title}</h3>
                    <p>{trip.description}</p>
                </div>
            )
        })
    }

    handleClick = (trip) =>{
        this.props.handlePublicTripClick(trip)
    }

    handleMouseEnter = (trip) =>{
        this.props.handleTripEnter(trip)
    }

    handleMouseLeave = () =>{
        this.props.handleTripLeave()
    }

    render(){
        return(
            <div className="trip-panel" style={{height:"50%"}}>
                <div className="trip-panel-title"> <h1>Browse Trips</h1> </div>
                <div className="trip-list" style={{height:"90%"}}>
                    {this.renderTrip()}
                </div>
            </div>
        )
    }
    
}
export default BrowseTrips;