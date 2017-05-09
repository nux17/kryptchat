import React from 'react';
import {
	View,
	Text,
	StyleSheet
} from 'react-native';
import { Link } from 'react-router-native';

class Conversation extends React.Component {
	render() {
		return (
			<Link to={`/conv/${this.props.name}`}>
				<View style={styles.container}>
					<Text>{this.props.name}</Text>
				</View>
			</Link>
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
});

export default Conversation;
