import React from 'react';
import { withRouter } from 'react-router';


// import { connect } from 'react-redux';

import { Link } from 'react-router-dom';

const ACCESS_TOKEN = 'pk.eyJ1Ijoia2lyaXJvdGhhIiwiYSI6ImNrZnljd3RwZTFscXYyc3M5M21hYnBzd3cifQ.QtkZoBqO03yMwmf8kyL0Ww'

class SignUp extends React.Component {

  state = {
    username: '',
    password: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    showAddress: false,
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
          // street: `${result.features[0]}.placename`,
          // city: result.features[0].context[1].text,
          // state: result.features[0].context[2].text,
          // zip: result.features[0].context[0].text,
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
    this.createUser()
  }

  createUser = () =>{
    const newUser = {
      user:{
        username: this.state.username,
        password: this.state.password,
        street: this.state.street,
        city: this.state.city,
        state: this.state.state,
        zip: this.state.zip,
        home_longitude: this.state.home_longitude,
        home_latitude: this.state.home_latitude
      }
    }
    console.log(newUser)
    fetch('http://localhost:3001/signup',{
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(newUser)
    })
    .then(res =>res.json())
    .then(token=> {
        console.log(token)
        if (token.auth_key){
          // console.log(token.user_id)
            localStorage.setItem('auth_key',token['auth_key'])
            localStorage.setItem('username',this.state.username)
            localStorage.setItem('user_id',token.user_id)
            localStorage.setItem('home_latitude',this.state.home_latitude)
            localStorage.setItem('home_longitude',this.state.home_longitude)
            this.props.handleLogIn(this.state.username, token.user_id)
            this.props.history.push('/user')
        }else{
            this.props.failedLogIn()
            this.props.history.push('/login')
        }
    })
  }

  handleUserSubmit  = (e) =>{
    e.preventDefault()
    this.setState({
        ...this.state,
        showAddress: true
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


  render(){
    return (
        <div>
            <div className="login-page">
                <div className='nav'>
                    <div className='nav-logo'/>
                    <div></div>
                </div>
                {
                    !this.state.showAddress
                ?
                    <div className="form" >
                        <div className="form-title"><h1 style={{fontWeight:'bold'}}>Sign Up</h1></div>
                        <form className="login-form"onSubmit={this.handleUserSubmit} >
                            <input type="text" onChange={this.handleInputChange} name='username' placeholder="Username"  required/>
                            <input type="password" onChange={this.handleInputChange} name='password' placeholder="Password" required/>
                            <input type="password" onChange={this.handleInputChange} name='password-verify' placeholder="Verify Password" required/>
                            <button id="submit" type="submit" value="Submit">Sign Up</button>
                            <p className="message">Already have an account? <Link to='/login'>Click Here</Link></p>
                        </form>
                    </div>
                :
                    <div className="form">
                        <div className="form-title"><h1 style={{fontWeight:'bold'}}>User Info</h1></div>
                        <div className="address-search-results">{this.renderSearchReults()}</div>
                        <form className="login-form"onSubmit={this.handleSubmit} >
                            <input type="text" onChange={this.handleInputChange} value={this.state.street} name='street' placeholder="Street Adress" required/>
                            <input type="text" onChange={this.handleInputChange} value={this.state.city} name='city' placeholder="City" required/>
                            <input type="text" onChange={this.handleInputChange} value={this.state.state} name='state' placeholder="State" required/>
                            <input type="text" onChange={this.handleInputChange} value={this.state.zip} name='zip' placeholder="Zip Code" required/>
                            <button id="submit" type="submit" value="Submit">Continue</button>
                            <p className="message">Already have an account? <Link to='/login'>Click Here</Link></p>
                        </form>
                    </div>
                }
            </div>            
        </div>  
    )
  }
}
export default withRouter(SignUp);
