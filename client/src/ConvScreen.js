import React from 'react';
import {
	ListView,
	StyleSheet,
	TextInput,
	KeyboardAvoidingView,
	View,
	Dimensions,
	Text,
	AsyncStorage
} from 'react-native';
import Bubble from "./Bubble";
import Link from "react-router-native/Link";
import {
	encrypt,
	decrypt,
	getKeys,
	getJWT,
	getCurrentUser,
	getKeyForUser
} from './security';

class ConvScreen extends React.Component {
	constructor() {
		super();
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
		this.state = {
			ds,
			dataSource: ds.cloneWithRows([]),
			interval: null
		};
	}

	async _loadData() {
		try {
			const username = await getCurrentUser();
			const keys = await getKeys();
			const jwt = await getJWT();

			fetch(`https://kryptchat.me/messages?contact=${this.props.match.params.name}`, {
				method: 'GET',
				headers: {
					'JWToken': `${jwt}`,
					'Accept': 'application/json',
				},
				credentials: 'include'
			})
				.then(response => response.json())
				.then(async json => {
					try {
						let storedMessages = await AsyncStorage.getItem(`${username}-messages-${this.props.match.params.name}`);
						if (!storedMessages) {
							storedMessages = [];
						} else {
							storedMessages = JSON.parse(storedMessages);
						}
						for (let i = 0; i < json.length; ++i) {
							const msg = decrypt(JSON.parse(json[i].message_body), keys.private);
							if (msg) {
								storedMessages.push({
									msg,
									sender: json[i].user_from_name
								})
							}
						}
						await AsyncStorage.setItem(`${username}-messages-${this.props.match.params.name}`, JSON.stringify(storedMessages));
						this.setState({
							dataSource: this.state.ds.cloneWithRows(storedMessages),
						});
					} catch (e) {
						console.error(e);
					}
				})
				.catch(e => console.log(e));
		} catch (e) {
			console.error(e);
		}
	}

	componentWillMount() {
		this._loadData();
		this.setState({
			interval: setInterval(this._loadData.bind(this), 3000)
		});
	}

	componentWillUnmount() {
		if (this.state.interval) {
			clearInterval(this.state.interval);
			this.setState({
				interval: null,
			});
		}
	}

	render() {
		return (
			<KeyboardAvoidingView behavior={'padding'} style={styles.container}>
				<View style={styles.header}>
					<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
						<Text>{this.props.match.params.name}</Text>
					</View>
					<Link style={{position: 'absolute', left: 10, top: 10}} to="/list">
						<Text>back</Text>
					</Link>
				</View>
				<ListView
					style={styles.list}
					dataSource={this.state.dataSource}
					renderRow={({msg, sender}) => <Bubble msg={msg} sender={sender} />}
					enableEmptySections={true}
				/>
				<View style={styles.inputContainer}>
					<TextInput
						placeholder="message"
						style={styles.default}
						onChangeText={(message) => this.setState({message})}
						value={this.state.message}
						onSubmitEditing={async () => {
							const c = encrypt(this.state.message, await getKeyForUser(this.props.match.params.name));
							try {
								const username = await getCurrentUser();
								fetch(`https://kryptchat.me/messages/`, {
									method: 'POST',
									headers: {
										'Accept': 'application/json',
										'Content-Type': 'application/json',
										'JWToken': await getJWT(),
									},
									body: JSON.stringify({
										user_to: this.props.match.params.name,
										message_body: JSON.stringify(c),
									})
								})
									.then(async () => {
										let storedMessages = await AsyncStorage.getItem(`${username}-messages-${this.props.match.params.name}`);
										if (!storedMessages) {
											storedMessages = [];
										} else {
											storedMessages = JSON.parse(storedMessages);
										}
										storedMessages.push({
											msg: this.state.message,
											sender: username,
										});
										await AsyncStorage.setItem(`${username}-messages-${this.props.match.params.name}`, JSON.stringify(storedMessages));
										this.setState({
											dataSource: this.state.ds.cloneWithRows(storedMessages),
											message: '',
										});
									});
							} catch (e) {
								console.error(e);
							}
						}}
					/>
				</View>
			</KeyboardAvoidingView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	list: {
		flex: 1,
	},
	default: {
		height: 26,
		borderWidth: 0.5,
		borderColor: '#0f0f0f',
		fontSize: 13,
		padding: 4,
	},
	header: {
		padding: 10,
		flexDirection: 'row',
		width: Dimensions.get('window').width,
	}
});

export default ConvScreen;
