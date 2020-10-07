import React from 'react';
import { withRouter } from 'react-router';

import { Link } from 'react-router-dom';


class Login extends React.Component {

  state = {
    username: '',
    password: '',
    userId: ''
  }

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const newUser = {
      username: this.state.username,
      password: this.state.password
    }
    // console.log(newUser)
    fetch('http://localhost:3001/login',{
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(newUser)
    })
    .then(res =>res.json())
    .then(token=> {
            // console.log(token)
        if (token.auth_key){
            // console.log(token.user_id)
            localStorage.setItem('auth_key',token['auth_key'])
            localStorage.setItem('username',this.state.username)
            this.props.handleLogIn(this.state.username, token.user_id)
            this.props.history.push('/user')
        }else{
            this.props.failedLogIn()
            this.props.history.push('/login')
        }
    })
  }

  render(){
    return (
        <div>
            <div className="login-page">
                <div className="form">
                    <form className="login-form"onSubmit={this.handleSubmit}>
                        <h2> Login </h2>
                        <input type="text" onChange={this.handleInputChange} name='username' placeholder="Username"  />
                        <input type="password" onChange={this.handleInputChange} name='password' placeholder="Password"/>
                        <button id="submit" type="submit" value="Submit">login</button>
                        <p className="message">Not registered? <Link to='/signup'>Create an account</Link></p>
                    </form>
                </div>
            </div>            
        </div>

        
    )
  }
}

export default withRouter(Login);