import React from 'react';
import {
	View,
	StyleSheet,
	ListView
} from 'react-native';
import { NativeRouter, Route } from 'react-router-native';
import ListScreen from './ListScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ConvScreen from './ConvScreen';
import NewContact from './NewContact';

class KryptChat extends React.Component {
	constructor() {
		super();
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			dataSource: ds.cloneWithRows(['row 1', 'row 2']),
		};
	}

	render() {
		return (
			<NativeRouter>
				<View style={styles.container}>
					<Route exact path="/" component={LoginScreen} />
					<Route path="/register" component={RegisterScreen} />
					<Route path="/list" component={ListScreen} />
					<Route path="/conv/:name" component={ConvScreen} />
					<Route path="/new-contact" component={NewContact} />
				</View>
			</NativeRouter>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#cfeaef',
		paddingTop: 20,
	},
});

export default KryptChat;
