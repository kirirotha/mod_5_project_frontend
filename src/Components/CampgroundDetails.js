import React from 'react';

class CampgroundDetails extends React.Component{
    renderDetails = () =>{
        window.scroll(0,0)
        return {__html: this.props.selectedCampground.properties.description}
    }

    handleCloseClick = () =>{
        this.props.closeDetailWindow()
    }

    renderPhone = () =>{
        if(this.props.selectedCampground.properties.phone){
            return(
                <div className="info-line">
                    <h3>Phone:</h3>
                    <p>{this.props.selectedCampground.properties.phone ? this.props.selectedCampground.properties.phone : null}</p>
                </div>
            )
        }
    }

    renderEmail = () =>{
        if(this.props.selectedCampground.properties.email){
            return(<div className="info-line">
                        <h3>Email:</h3>
                        <p>{this.props.selectedCampground.properties.email ? this.props.selectedCampground.properties.email : null}</p>
                    </div>
                    )
        }
    }

    renderReservable = () =>{
        if(this.props.selectedCampground.properties.reservable){
            return(
                <div className="info-line">
                    <h3>Reservable:</h3>
                    <p>{this.props.selectedCampground.properties.reservable ? "Yes" : "No"}</p> 
                </div>
            )
        }
    }
    renderForecast = () =>{
        let index = 0
        return this.props.weather.daily.map(daily =>{
            index++
            const timestamp = daily.dt;
            let a = new Date(timestamp*1000);
            let days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            let dayOfWeek = days[a.getDay()]
            if(index > 1){
                return(
                    <div className="daily-forecast" key={index}>
                        <h3>{dayOfWeek}</h3>
                        <img src={`http://openweathermap.org/img/wn/${daily.weather[0].icon}.png`} alt="current-weather" className="current-weather-icon"/>
                        <h3>{`${Math.floor(daily.temp.max)}\u00B0/${Math.floor(daily.temp.min)}\u00B0`}</h3>
                    </div>
                )
            }
        })
    }

    render(){
        return(
            <div className="detail-panel" onMouseEnter={() => this.props.handleOnMouseEnter(this.props.selectedCampground)}
                                            onMouseLeave={() => this.props.handleOnMouseLeave()}>
                <div className="close-button" onClick={this.handleCloseClick}>x</div>
                <div className="detail-panel-title"> 
                    <h1>{this.props.selectedCampground.properties.name}</h1> 
                    <div className="info-line" style={{display:'flex', justifyContent: 'space-evenly'}}>
                        <h3>Latitude:</h3>
                        <p>{Math.round(this.props.selectedCampground.properties.latitude * 100000) / 100000}</p>
                        <h3>Longitude:</h3>
                        <p>{Math.round(this.props.selectedCampground.properties.longitude* 100000) / 100000}</p>
                    </div>
                </div>
                
                <div className="campground-details" dangerouslySetInnerHTML={this.renderDetails()}></div>
                <div className="campground-info">
                    {this.renderPhone()}
                    {this.renderEmail()}
                    {this.renderReservable()}
                </div>
                <div className="weather-box">
                    <div className="current-weather">
                        <h2 style={{width: '100px'}}>Current Weather</h2>
                        {this.props.weather.daily ? <img src={`http://openweathermap.org/img/wn/${this.props.weather.current.weather[0].icon}@2x.png`} alt="current-weather" className="current-weather-icon"/> : null}
                        {this.props.weather.daily ? <h2 style={{width: '100px'}}>{this.props.weather.current.weather[0].description}</h2> : null}
                        <div>
                            {this.props.weather.daily ? <h1>{`${Math.floor(this.props.weather.current.temp)}\u00B0 F`}</h1> : null}
                        </div>
                    </div>
                    <div className="forecast">
                        {this.props.weather.daily ? this.renderForecast() : null}
                    </div>
                </div>
            </div>
        )
    }
}
export default CampgroundDetails;