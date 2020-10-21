import React from 'react';
import { withRouter } from 'react-router';


// import { connect } from 'react-redux';


const ACCESS_TOKEN = 'pk.eyJ1Ijoia2lyaXJvdGhhIiwiYSI6ImNrZnljd3RwZTFscXYyc3M5M21hYnBzd3cifQ.QtkZoBqO03yMwmf8kyL0Ww'

class EditAddress extends React.Component {

  state = {
    street: this.props.user.street,
    city: this.props.user.city,
    state: this.props.user.state,
    zip: this.props.user.zip,
    home_latitude: this.props.user.home_latitude,
    home_longitude: this.props.user.home_longitude, 
    searchResults: []
  }

  handleInputChange = (e) => {
    // console.log(e.target.name)
    // console.log(e.target.value)
    this.setState({
      [e.target.name]: e.target.value
    },
    () => this.autofillFetch()
    )
  }

  autofillFetch = () =>{
    if(this.state.street.length > 3 ){
      let query = this.state.street + " " + this.state.city
      query = query.split(" ").join("%20")
      // console.log(query)
      fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/us%20${query}.json?limit=3&access_token=${ACCESS_TOKEN}`)
      .then(res => res.json())
      .then(result =>{
        console.log(result.features)
        this.setState({
          ...this.state,
          home_latitude: result.features[0].center[0],
          home_longitude: result.features[0].center[1], 
          searchResults: result.features
        })
      })
    }
  }

  handleSubmit = (e) => {
    // console.log('click')
    e.preventDefault()
    this.editAddress()
  }

  editAddress = () =>{
    const patchData = {
        street: this.state.street,
        city: this.state.city,
        state: this.state.state,
        zip: this.state.zip,
        home_longitude: this.state.home_longitude,
        home_latitude: this.state.home_latitude
    }
    fetch(`http://localhost:3001/users/${this.props.user.id}`,{
        method: 'PATCH',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(patchData)
    })
    .then(res =>res.json())
    .then(user=> {
        console.log(user)
        localStorage.setItem('home_latitude',this.state.home_latitude)
        localStorage.setItem('home_longitude',this.state.home_longitude)
        this.props.updateUser(user)
    })
  }

  renderSearchReults = () =>{
    if(this.state.searchResults){
      let index = 0
      return this.state.searchResults.map(result =>{
        index ++
        return(
          <div className="address-search-item" key={index} onClick={() => this.handleSearchClick(result)}>
            {result.place_name}
          </div>
        )
      })
    }
  }

  handleSearchClick = (result) =>{
    let place_nameParsed = result.place_name.split(', ')
    let stateZip = place_nameParsed[2].split(' ')
    this.setState({
      ...this.state,
      street: place_nameParsed[0],
      city: place_nameParsed[1],
      state: stateZip[0],
      zip: stateZip[1],
      home_latitude: result.center[1],
      home_longitude: result.center[0], 
      searchResults: []
    })
  }

  clearFields = () =>{
      this.setState({
        ...this.state,
        street: '',
        city: '',
        state: '',
        zip: '',
        home_latitude: '',
        home_longitude: '', 
        searchResults: []
      })
  }

  handleCloseClick = () =>{
      this.props.closeEditAddressWindow()
  }

  render(){
    return (
        <div>
                    <div className="form">
                        <div className="close-button" onClick={this.handleCloseClick}>x</div>
                        <div className="form-title"><h1 style={{fontWeight:'bold'}}>Edit Home Address</h1></div>
                        <div className="address-search-results">{this.renderSearchReults()}</div>
                        <form className="login-form"onSubmit={this.handleSubmit} >
                            <input type="text" onChange={this.handleInputChange} value={this.state.street} name='street' placeholder="Street Adress" required/>
                            <input type="text" onChange={this.handleInputChange} value={this.state.city} name='city' placeholder="City" required/>
                            <input type="text" onChange={this.handleInputChange} value={this.state.state} name='state' placeholder="State" required/>
                            <input type="text" onChange={this.handleInputChange} value={this.state.zip} name='zip' placeholder="Zip Code" required/>
                            <button id="submit" type="submit" value="Submit">Save Address Change</button>
                            <p className="message" style={{cursor:'pointer'}} onClick={() =>{this.clearFields()}}>Click here to clear fields</p>
                        </form>
                    </div>            
        </div>  
    )
  }
}
export default withRouter(EditAddress);