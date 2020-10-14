import React from 'react';

class CreateTrip extends React.Component{

    state = {
        title: '',
        description: '',
        userId: Number(localStorage.user_id),
        startHome: false
      }

    handleInputChange = (e) => {
        this.setState({
          [e.target.name]: e.target.value
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        const newTrip = {
            title: this.state.title,
            description: this.state.description,
            user_id: this.state.userId
        }
        fetch('http://localhost:3001/trips',{
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(newTrip)
        })
        .then(res => res.json())
        .then(newTrip =>{
            this.props.submitNewTrip(newTrip)
        })
    }

    render(){
        return(
            <div className="trip-panel" style={{height: '50%'}}>
                <div className="trip-panel-title"> <h1>Create New Road Trip</h1> </div>
                <form className="trip-form"onSubmit={this.handleSubmit}>
                    <div style={{marginTop: '40px'}}>
                        <input type="text" onChange={this.handleInputChange} name='title' placeholder="Title"  />
                        <textarea type="text" onChange={this.handleInputChange} 
                                            name='description' placeholder="Description"
                                            style={{height: '200px'}}/>
                        <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                            <input type='checkbox' onChange={this.handleInputChange} 
                                    name= 'startHome' style={{width:'30px', fontSize: "16px"}}/>
                            <p className="message"> Start from home</p>
                        </div>
                        <button id="submit" type="submit" value="submit">Create New Trip</button>
                   </div>
                </form>      
            </div>
        )
    }
}
export default CreateTrip;