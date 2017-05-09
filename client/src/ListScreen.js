import React from 'react';
import {
	ListView,
	View,
	Text,
	TouchableHighlight,
	StyleSheet,
	AsyncStorage
} from 'react-native';
import Conversation from "./Conversation";
import { Link } from 'react-router-native';
import {
	getAllContacts,
	getCurrentUser,
	getKeys,
	setCurrentUser,
	getJWT,
	setJWT,
	decrypt,
	setKeyForUser
} from './security';

class ListScreen extends React.Component {
	constructor() {
		super();
		const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => (r1.username !== r2.username || r1.key !== r2.key) });
		this.state = {
			ds,
			dataSource: ds.cloneWithRows([]),
			interval: null
		};
	}

	async _loadData() {
		try {
			const contacts = await getAllContacts();
			this.setState({
				dataSource: this.state.ds.cloneWithRows(contacts),
			});
		} catch (e) {
			console.error(e);
		}
	}

	async _loadAllMessages() {
		try {
			const username = await getCurrentUser();
			const keys = await getKeys();
			const jwt = await getJWT();

			fetch(`https://kryptchat.me/messages`, {
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
						let messages = [];
						let contacts = await getAllContacts();
						for (let i = 0; i < json.length; ++i) {
							const msg = decrypt(JSON.parse(json[i].message_body), keys.private);
							if (msg) {
								let contact = null;
								for (let j = 0; j < messages.length; ++j) {
									if (messages[j].contact === json[i].user_from_name) {
										m = messages[j];
										contact = messages[j];
										break;
									}
								}
								if (!contact) {
									for (let j = 0; j < contacts.length; ++j) {
										if (contacts[j].username === json[i].user_from_name) {
											let msgs = await AsyncStorage.getItem(`${username}-messages-${json[i].user_from_name}`);
											if (!msgs) {
												msgs = [];
											} else {
												msgs = JSON.parse(msgs);
											}
											contact = {
												contact: json[i].user_from_name,
												messages: msgs
											};
											messages.push(contact);
										}
									}
								}
								if (!contact) {
									contact = {
										contact: json[i].user_from_name,
										messages: [],
									};
									contacts.push({
										username: json[i].user_from_name,
										key: JSON.parse(msg)
									});
									await setKeyForUser(json[i].user_from_name, JSON.parse(msg));
									continue;
								}
								contact.messages.push({
									msg,
									sender: json[i].user_from_name
								})
							}
						}
						for (let i = 0; i < messages.length; ++i) {
							await AsyncStorage.setItem(`${username}-messages-${messages[i].contact}`, JSON.stringify(messages[i].messages));
						}
						this.setState({
							dataSource: this.state.ds.cloneWithRows(contacts),
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

	componentDidMount() {
		this._loadData();
		this._loadAllMessages();
		this.setState({
			interval: setInterval(this._loadAllMessages.bind(this), 3000)
		});
	}

	componentWillUnmount() {
		if (this.state.interval) {
			clearInterval(this.state.interval);
			this.setState({
				interval: null
			});
		}
	}

	async logout() {
		await setCurrentUser('');
		await setJWT('');
		this.props.history.push('/');
	}

	render() {
		return (
			<View style={styles.container}>
				<ListView
					style={styles.container}
					dataSource={this.state.dataSource}
					renderRow={(rowData) => <Conversation name={rowData.username} key={rowData.key} />}
					enableEmptySections={true}
				/>
				<View style={styles.footer}>
					<Link style={styles.button} to="/new-contact">
						<Text>New contact</Text>
					</Link>
					<TouchableHighlight style={styles.button} onPress={this.logout.bind(this)}>
						<Text>Log out</Text>
					</TouchableHighlight>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	footer: {
		padding: 10,
		alignItems: 'center',
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
		minWidth: 200,
		alignItems: 'center',
		marginBottom: 10,
	}
});

export default ListScreen;
