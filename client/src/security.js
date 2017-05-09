import AES from 'crypto-js/aes';
import CryptoJS from 'crypto-js';
import RSA from 'react-native-rsa';
import { randomBytes } from 'react-native-randombytes';
import {
	AsyncStorage
} from 'react-native';

export function encrypt(message, publicKey) {
	const aesKey = randomBytes(32).toString('hex');
	const hmacKey = randomBytes(32).toString('hex');
	const IV = randomBytes(16).toString('hex');

	const aes = AES.encrypt(message, aesKey, { IV });
	const hmac = CryptoJS.HmacSHA3(aes.ciphertext.toString(), hmacKey).toString();
	const rsa = new RSA();
	rsa.setPublicString(publicKey);

	return {
		aes: aes.toString(),
		ciphertext: aes.ciphertext.toString(),
		hmac,
		keys: rsa.encrypt(aesKey + hmacKey)
	};
}

export function decrypt(encrypted, privateKey) {
	const rsa = new RSA();
	rsa.setPrivateString(privateKey);
	const keys = rsa.decrypt(encrypted.keys);

	if (keys) {
		const aesKey = keys.substring(0, keys.length / 2);
		const hmacKey = keys.substring(keys.length / 2, keys.length);

		if (CryptoJS.HmacSHA3(encrypted.ciphertext, hmacKey).toString() === encrypted.hmac) {
			return AES.decrypt(encrypted.aes, aesKey).toString(CryptoJS.enc.Utf8);
		}
	}
	return null;
}

export async function getKeys() {
	try {
		const username = await getCurrentUser();
		let keys = await AsyncStorage.getItem(username);
		if (keys == null) {
			const rsa = new RSA();
			rsa.generate(2048, '10001');
			keys = JSON.stringify({ public: rsa.getPublicString(), private: rsa.getPrivateString()});
			try {
				await AsyncStorage.setItem(username, keys);
			} catch (e) {
				return null;
			}
		}
		return JSON.parse(keys);
	} catch (e) {
		return null;
	}
}

export async function setKeyForUser(username, key) {
	try {
		await AsyncStorage.setItem(username + '-pkey-' + await getCurrentUser(), key);
	} catch (e) {
		console.error(e);
	}
}

export async function getKeyForUser(username) {
	try {
		return await AsyncStorage.getItem(username + '-pkey-' + await getCurrentUser());
	} catch (e) {
		console.error(e);
		return null;
	}
}

export async function getCurrentUser() {
	try {
		return await AsyncStorage.getItem('currentUser');
	} catch (e) {
		console.error(e);
		return null;
	}
}

export async function setCurrentUser(username) {
	try {
		await AsyncStorage.setItem('currentUser', username);
	} catch (e) {
		console.error(e);
	}
}

export async function getJWT() {
	try {
		return await AsyncStorage.getItem('jwt');
	} catch (e) {
		console.error(e);
		return null;
	}
}

export async function setJWT(jwt) {
	try {
		await AsyncStorage.setItem('jwt', jwt);
	} catch (e) {
		console.error(e);
	}
}

export async function getAllContacts() {
	try {
		const currentUser = await getCurrentUser();
		const storage = await AsyncStorage.getAllKeys();
		const keys = storage.filter(item => item.match(`-pkey-${currentUser}$`));
		const values = await AsyncStorage.multiGet(keys);
		const ret = [];
		for (let i = 0; i < keys.length; ++i) {
			const index = keys[i].indexOf(`-pkey-${currentUser}`);
			ret.push({
				username: keys[i].slice(0, index),
				key: values[i]
			});
		}
		return ret;
	} catch (e) {
		console.error(e);
	}
}
