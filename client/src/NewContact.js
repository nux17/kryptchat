import React from 'react';
import {
	View,
	TextInput,
	StyleSheet,
	Text,
	TouchableHighlight,
	Share,
	Dimensions
} from 'react-native';
import {
	getKeys,
	setKeyForUser,
	getCurrentUser,
	getJWT,
	encrypt
} from './security';
import Base64 from 'base-64';
import { Link } from 'react-router-native';

class NewContact extends React.Component {
	constructor() {
		super();
		this.state = {
			other: '',
			publickey: ''
		}
	}

	async _loadData() {
		try {
			const keys = await getKeys();
			this.setState({
				publickey: Base64.encode(JSON.stringify({ username: await getCurrentUser(), key: JSON.parse(keys.public).n})),
			});
		} catch (e) {
			console.error(e);
		}
	}

	componentWillMount() {
		this._loadData();
	}

	async validate() {
		const keys = await getKeys();
		const infos = JSON.parse(Base64.decode(this.state.other));
		console.log(infos);
		const contactKey = JSON.stringify({
			n: infos.key,
			e: '10001'
		});
		const c = encrypt(JSON.stringify(keys.public), contactKey);
		try {
			fetch(`https://kryptchat.me/messages/`, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'JWToken': await getJWT(),
				},
				body: JSON.stringify({
					user_to: infos.username,
					message_body: JSON.stringify(c),
				})
			})
				.then(async () => {
					await setKeyForUser(infos.username, contactKey);
					this.props.history.push('/list');
				});
		} catch (e) {
			console.error(e);
		}
	}

	share() {
		Share.share({
			title: 'Add me on KryptChat!',
			message: this.state.publickey,
		});
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.header}>
					<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
						<Text>Add new contact</Text>
					</View>
					<Link style={{position: 'absolute', left: 10, top: 10}} to="/list">
						<Text>back</Text>
					</Link>
				</View>
				<Text>Your public key:</Text>
				<TextInput
					placeholder="publickey"
					style={[styles.default, { height: 100 }]}
					value={this.state.publickey}
					multiline={true}
					selectTextOnFocus={true}
				/>
				<TouchableHighlight style={styles.button} onPress={this.share.bind(this)}>
					<Text>Share</Text>
				</TouchableHighlight>
				<View style={{ height: 20 }} />
				<TextInput
					ref="publickey"
					autoCapitalize="none"
					placeholder="publickey"
					autoCorrect={false}
					style={[styles.default, { height: 100 }]}
					onChangeText={(other) => this.setState({other})}
					value={this.state.other}
					returnKeyType="done"
					onSubmitEditing={this.validate.bind(this)}
					multiline={true}
				/>
				<View style={styles.footer}>
					<TouchableHighlight style={styles.button} onPress={this.validate.bind(this)}>
						<Text>OK</Text>
					</TouchableHighlight>
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
		borderRadius: 5,
		marginBottom: 10,
	},
	header: {
		padding: 10,
		flexDirection: 'row',
		width: Dimensions.get('window').width,
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

export default NewContact;
