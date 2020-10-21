import React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
// import DropdownButton from 'react-bootstrap/DropdownButton'
// import Dropdown from 'react-bootstrap/Dropdown'


class Navbar extends React.Component{
    state = {
        dropdownActive:false,
        userDropdownActive: false
    }

    handleLogoutClick = () =>{
        this.props.handleLogOut()
    }

    handleDropdownClick = () =>{
        this.setState({
            dropdownActive: !this.state.dropdownActive
        },
         () =>{
             setTimeout(() =>{
                this.setState({
                    dropdownActive: false
                })
             }, 5000)
         }
        )
    }

    handleDropdownItemClick = (e) =>{
        this.setState({
            dropdownActive: false
        },
        () =>{
            setTimeout(() =>{
               this.setState({
                   dropdownActive: false
               })
            }, 5000)
        })
        this.props.changeMode(e.target.value)
    }

    handleExploreClick = () =>{
        this.setState({
            dropdownActive: false
        })
        this.props.changeMode('explore')
    }

    

    renderTripDropdown = () =>{
        return(
            <div>
                <div id="myDropdown" className="dropdown-content">
                    <button className='dropdown-button' 
                            value='browse' 
                            onClick={this.handleDropdownItemClick} 
                            disabled={this.props.mode === 'browse' ? true : false}>Browse Trips</button>
                    <button className='dropdown-button' 
                            value='myTrips' 
                            onClick={this.handleDropdownItemClick} 
                            disabled={this.props.mode === 'myTrips' ? true : false}>My Trips</button>
                    <button className='dropdown-button' 
                            value='createNew' 
                            onClick={this.handleDropdownItemClick} 
                            disabled={this.props.mode === 'createNew' ? true : false}>Create New</button>
                </div>
            </div>
        )
    }

    renderUserDropdown = () =>{
        return(
            <div id="myDropdown" className="dropdown-content"
                                style={{marginLeft:'-48px', marginTop:'20px'}}>
                <button className='dropdown-button' 
                        value='editAddress' 
                        onClick={this.editAddressClick} 
                        >Edit Home Address</button>
                <Link to='/login'><button className='dropdown-button' 
                        value='logout' 
                        onClick={this.handleLogoutClick} 
                        >Logout</button></Link>
            </div>
        )
    }

    handleUserDropDownClick = () =>{
        this.setState({
            userDropdownActive: !this.state.userDropdownActive
        },
         () =>{
             setTimeout(() =>{
                this.setState({
                    userDropdownActive: false
                })
             }, 5000)
         }
        )
    }

    editAddressClick = () =>{
        this.props.editAddress()
    }

    render() {
        return (
            <div className='nav'>
                <div className='nav-logo'/>
                <div></div>
                <div className='button-bar'>
                    <div>
                        <button onClick={this.handleExploreClick} disabled={this.props.mode === 'explore' ? true : false}>Explore</button>
                    </div>
                    <div>
                        <div className="dropdown">
                            <button onClick={this.handleDropdownClick} className="dropbtn">{this.state.dropdownActive ? "Trips     \u25B2"  : "Trips      \u25BC"}</button>
                            {this.state.dropdownActive ? this.renderTripDropdown() : null}
                        </div>
                    </div>
                    {/* <div>
                        <Link to='/login'><button onClick={this.handleLogoutClick} name="logout">LogOut</button></Link>
                    </div> */}
                    <div>
                        <button onClick={this.handleUserDropDownClick} className="user-button"></button>
                        {this.state.userDropdownActive ? this.renderUserDropdown() : null}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Navbar);