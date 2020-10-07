import React, { Component } from 'react';
import './App.css';

// import { connect } from 'react-redux';

import Login from './Components/auth/Login'
import SignUp from './Components/auth/SignUp'
import Map from './Components/Map'


import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';


class App extends Component {
  state ={
    loggedIn: false,
    username: "",
    userId: ""
  }

  handleLogIn = (username, userId) =>{
    if(localStorage.getItem('auth_key')){
      this.setState({
        ...this.state,
        loggedIn: true,
        username: username,
        userId: userId
      })
    }
  }
  
  
  handleLogOut = () =>{
    localStorage.clear()
    return <Redirect push to="/login" />
  }
  
  failedLogIn = () =>{
    localStorage.clear()
    this.setState({
      ...this.state,
      loggedIn: false,
      username: "",
      password: ""
    }, () =>{
      return <Redirect push to="/login" />
    })
  }
  

  render(){
    return (
    <div className="parent" >
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={() => {
              if(localStorage.getItem('auth_key')){
                return <Map handleLogOut={this.handleLogOut}/>
              }else{
                return <Redirect to="/login" />
              }
            }} />

            <Route path="/login" component={() =>{
              return <Login handleLogIn={this.handleLogIn} failedLogIn={this.failedLogIn}/> 
            }}/>

            <Route path="/signup" component={()=>{
              return <SignUp handleLogIn={this.handleLogIn} failedLogIn={this.failedLogIn}/> 
            }} />

            <Route path="/logout" component={() => {
              localStorage.clear()
              this.handleLogOut()
              return <Redirect to="/login" />
            }} />

            <Route>
              <Redirect to="/" />
            </Route>

          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
