import React from 'react';
import {updateUserSetting, getUserSetting} from '../server';
import {resetDatabase} from '../database';

const initial_user = 1;

export default class Config extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user_id: initial_user,
			username: '',
			password: '',
			email: '',
		}
		this.handleUsernameChange = this.handleUsernameChange.bind(this);
		this.handleEmailChange = this.handleEmailChange.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleSave = this.handleSave.bind(this);
	}
	componentDidMount() {
		getUserSetting(this.state.user_id, (setting) => {
			console.log(JSON.stringify(setting));
			this.setState(setting);
		});
	}
	handleSave(){
		updateUserSetting(this.state, (userInfo) => {
			console.log(JSON.stringify(userInfo));
		});
	}
	handleCancel(){
		getUserSetting(this.state.user_id, (setting) => {
			this.setState(setting);
		});
	}
	handleUsernameChange(event){
		event.preventDefault();
		var newUsername = event.target.value;
		this.setState({
			username: newUsername,
		});
	}
	handleEmailChange(event) {
		event.preventDefault();
		var newEmail = event.target.value;
		this.setState({
			email: newEmail,
		});
	}
	handlePasswordChange(event) {
		event.preventDefault();
		var newPassword = event.target.value;
		this.setState({
			password: newPassword,
		});
	}
	render() {
		return (
			<div>
				<div className="col-xs-8">
					<div className="panel panel-default">
						<div className= "panel-color">
							<div className="panel-body">
								<font size="5">General Account Configuration </font>
								<div className="row">
									<div className= "col-xs-3">
										<strong>Username</strong>
									</div>
									<div className= "col-xs-5">
										<div className="input-style">
											<input type="text" className="form-control" value={this.state.username} onChange={this.handleUsernameChange}/>
										</div>
									</div>
								</div>
								<hr />
								<div className="row">
									<div className= "col-xs-3">
										<strong>Email</strong>
									</div>
									<div className= "col-xs-5">
										<div className="input-style">
											<input type="text" className="form-control" value={this.state.email} onChange={this.handleEmailChange} />
										</div>
									</div>
								</div>
								<hr />
								<div className="row">
									<div className= "col-xs-3">
										<strong>Password</strong>
									</div>
									<div className= "col-xs-5">
										<div className="input-style">
											<input type="text" className="form-control" value={this.state.password} onChange={this.handlePasswordChange} />
										</div>
									</div>
								</div>
								<hr />
								<div className="row">	
									<button className="button-style" onClick={this.handleSave} >
										<span className="glyphicon glyphicon-check"></span>
										Save
									</button>
									<button className="button-style" onClick={this.handleCancel}>
										<span className="glyphicon glyphicon-remove"></span>
										Cancel
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-xs-4">
					<p><button type='button' onClick={resetDatabase}> Reset Database</button></p>
				</div>
			</div>
		);
	}
}
