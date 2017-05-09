import './shim.js'
import React, { Component } from 'react';
import {
	AppRegistry,
	StyleSheet,
} from 'react-native';

import KryptChat from "./src/KryptChat";

export default class Kryptchat extends Component {
	render() {
		return (
      <KryptChat/>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
	instructions: {
		textAlign: 'center',
		color: '#333333',
		marginBottom: 5,
	},
});

AppRegistry.registerComponent('Kryptchat', () => Kryptchat);
