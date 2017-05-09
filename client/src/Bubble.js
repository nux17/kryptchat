import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import {
	getCurrentUser,
} from './security';

class Bubble extends React.Component {
	constructor() {
		super();
		this.state = {
			username: '',
		}
	}

	async _fetchUsername() {
		this.setState({
			username: await getCurrentUser()
		});
	}

	componentWillMount() {
		this._fetchUsername();
	}

	render() {
		return (
			<View style={[styles.container, this.props.sender === this.state.username ? styles.me : styles.other]}>
				<Text>{this.props.msg}</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f7fdff',
		paddingTop: 20,
		paddingBottom: 20,
		paddingLeft: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#9d9d9d',
		borderRightWidth: 1,
		borderRightColor: '#9d9d9d',
		borderTopWidth: 1,
		borderTopColor: '#e8eef0',
		borderLeftWidth: 1,
		borderLeftColor: '#e8eef0',
		borderRadius: 5,
		marginLeft: 2,
		marginRight: 2,
		marginBottom: 5,
	},
	me: {
		marginLeft: 50,
		backgroundColor: '#ffcfa8',
	},
	other: {
		marginRight: 50,
		backgroundColor: '#f7fdff',
	}
});

export default Bubble;
