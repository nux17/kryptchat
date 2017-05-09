import React from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	Text,
	TouchableHighlight
} from 'react-native';
import { Link } from 'react-router-native';
import {
	setCurrentUser,
	setJWT
} from './security';

class LoginScreen extends React.Component {
	constructor() {
		super();
		this.state = {
			login: '',
			password: '',
		}
	}

	async validate() {
		fetch('https://kryptchat.me/login/', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: this.state.login,
				password: this.state.password
			})
		})
			.then(response => {
				if (response.status >= 300) {
					return null;
				}
				return response.text();
			})
			.then(async text => {
				if (text) {
					await setCurrentUser(this.state.login);
					await setJWT(text);
					this.props.history.push('/list');
				}
			});
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<Text>Login</Text>
				</View>
				<TextInput
					ref="login"
					autoCapitalize="none"
					placeholder="login"
					autoCorrect={false}
					style={styles.default}
					onChangeText={(login) => this.setState({login})}
					value={this.state.login}
					onSubmitEditing={() => this.refs['pwd'].focus()}
				/>
				<TextInput
					ref="pwd"
					secureTextEntry={true}
					autoCapitalize="none"
					placeholder="password"
					autoCorrect={false}
					style={styles.default}
					onChangeText={(password) => this.setState({password})}
					value={this.state.password}
					returnKeyType="done"
					onSubmitEditing={this.validate.bind(this)}
				/>
				<View style={styles.footer}>
					<TouchableHighlight style={styles.button} onPress={this.validate.bind(this)}>
						<Text>OK</Text>
					</TouchableHighlight>
					<Link style={styles.button} to="/register">
						<Text>Register</Text>
					</Link>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		marginTop: 20,
	},
	default: {
		height: 35,
		fontSize: 13,
		paddingLeft: 20,
		paddingRight: 20,
		backgroundColor: '#f7fdff',
		borderBottomWidth: 1,
		borderBottomColor: '#9d9d9d',
		borderRightWidth: 1,
		borderRightColor: '#9d9d9d',
		borderTopWidth: 1,
		borderTopColor: '#e8eef0',
		borderLeftWidth: 1,
		borderLeftColor: '#e8eef0',
		borderRadius: 5,
		marginBottom: 10,
	},
	header: {
		padding: 20,
		alignItems: 'center',
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	button: {
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 10,
		paddingBottom: 10,
		backgroundColor: '#f7fdff',
		borderBottomWidth: 1,
		borderBottomColor: '#9d9d9d',
		borderRightWidth: 1,
		borderRightColor: '#9d9d9d',
		borderTopWidth: 1,
		borderTopColor: '#e8eef0',
		borderLeftWidth: 1,
		borderLeftColor: '#e8eef0',
		borderRadius: 5,
		minWidth: 100,
		alignItems: 'center',
	}
});

export default LoginScreen;
