import { decode } from 'base64-arraybuffer';

export const generateRandomString = async (length: number, useNodeCrypto: boolean) => {
	let cryptoInstance
	if (useNodeCrypto) {
		cryptoInstance = require('crypto').webcrypto
	} else {
		cryptoInstance = crypto
	}

	var q = '';
	for (var i = 0; i < length; i++) {
		q += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split(
			''
		)[
			Math.floor(
				(cryptoInstance.getRandomValues(new Uint8Array(1))[0] / 255) * 61
			)
		];
	}
	return q;
};

export const verifyJWT = async (token: string, key: string, useNodeCrypto: boolean) => {
	let cryptoInstance
	if (useNodeCrypto) {
		cryptoInstance = require('crypto').webcrypto
	} else {
		cryptoInstance = crypto
	}

	let baseKey = await cryptoInstance.subtle.importKey(
		'raw',
		new TextEncoder().encode(key),
		{ name: 'HMAC', hash: 'SHA-256' }, //HS256
		false,
		['verify']
	);
	var splited = token.split('.');

	let sig = decode(decodeurlsafeBase64(splited[2]));
	let isValid = await cryptoInstance.subtle.verify(
		{ name: 'HMAC' },
		baseKey,
		sig,
		new TextEncoder().encode(`${splited[0]}.${splited[1]}`)
	);
	let data = decodeurlsafeBase64(splited[1])
	return { valid: isValid, data: new TextDecoder().decode(decode(data)) };
};

export const generateJWT = async (userId: string, key: string, useNodeCrypto: boolean) => {
	let cryptoInstance
	if (useNodeCrypto) {
		cryptoInstance = require('crypto').webcrypto
	} else {
		cryptoInstance = crypto
	}

	let headerData = urlsafeBase64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
	let payload = urlsafeBase64(
		JSON.stringify({
			uid: userId,
		})
	);

	let baseKey = await cryptoInstance.subtle.importKey(
		'raw',
		new TextEncoder().encode(key),
		{ name: 'HMAC', hash: 'SHA-256' }, //HS256
		false,
		['sign']
	);

	let sig = await cryptoInstance.subtle.sign(
		{ name: 'HMAC' },
		baseKey,
		new TextEncoder().encode(`${headerData}.${payload}`)
	);

	return `${headerData}.${payload}.${urlsafeBase64(
		String.fromCharCode(...Array.from(new Uint8Array(sig)))
	)}`;
};

const urlsafeBase64 = (dat: string) => {
	let base = btoa(dat);
	return base.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const decodeurlsafeBase64 = (dat: string) => {
	dat += Array(5 - (dat.length % 4)).join('=');

	var data = dat.replace(/\-/g, '+').replace(/\_/g, '/');
	return data;
};
