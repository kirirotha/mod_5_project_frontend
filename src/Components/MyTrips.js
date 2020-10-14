import React from 'react';

class MyTrips extends React.Component{


    renderTrip = ()=>{
        return this.props.myTrips.map(trip =>{
            return(
                <div className='trip' onClick={() => this.handleClick(trip)} key={trip.id}>
                    <h3>{trip.title}</h3>
                    <p>{trip.description}</p>
                </div>
            )
        })
    }

    handleClick = (trip) =>{
        this.props.handleMyTripClick(trip)
    }

    render(){
        return(
            <div className="trip-panel" style={{height:"50%"}}>
                <div className="trip-panel-title"> <h1>My Trips</h1> </div>
                <div className="trip-list" style={{height:"90%"}}>
                    {this.renderTrip()}
                </div>
            </div>
        )
    }
}
export default MyTrips;