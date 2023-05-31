import axios from 'axios';
import {useEffect} from 'react';
import io, { Socket }         from 'socket.io-client';
import * as utils from './utils'

export enum ChannelStatus {
	public,
	password,
	private,
	directMessage // Special mode: both user are chanops, neither can add other people to the discussion
}

// =============================================================================
// ------------------------------ MAIN CONNECTION ------------------------------
// =============================================================================
export function connectToChatSocket()
{
	// =====================================================================
	// Connecting to socket namespace, and defining the headers
	// which will be sent with all the subsequent responses
	// =====================================================================
	const socket = io(`${import.meta.env.VITE_FRONT_URL}/chat`, {
		query      : { jwt: utils.getTokenizedJwtFromCooke()},
		transports : ['websocket']
	});
	// =====================================================================
	// Activating the connect / disconnect event listener
	// =====================================================================
	//socket.on('connect',    () => { console.log('Connected to WebSocket server'); });
	//socket.on('disconnect', () => {
	//console.log('Disconnected from WebSocket server');
	//socket.emit('disconnect-message', 'The client has disconnected');
	//});
	return socket;
}

export function connectToGameSocket()
{
	// =====================================================================
	// Connecting to socket namespace, and defining the headers
	// which will be sent with all the subsequent responses
	// =====================================================================
	const socket = io(`${import.meta.env.VITE_FRONT_URL}/game`, {
		query      : { jwt: utils.getTokenizedJwtFromCooke()},
		transports : ['websocket']
	});
	// =====================================================================
	// Activating the connect / disconnect event listener
	//=====================================================================
	socket.on('connect',    () => { console.log('Connected to GameSocket server'); });
	socket.on('disconnect', () => {
		console.log('Disconnected from GameSocket server');
		socket.emit('disconnect-message', 'The client has disconnected from GameSocket');
	});
	return socket;
}



// =============================================================================
// ------------------------------ SOCKET METHODS -------------------------------
// =============================================================================

// =============================================================================
// ----------------------- Joining queue for random game -----------------------
// =============================================================================

function joinQueueRandomGame(p:any) {
	p.socket.emit('client.random_game')
}

//// =================================================================
//// ---------------------- Creating Channel -----------------------
//// =================================================================
function createChannel(p: {socket: Socket | {}, name: string, type: number, password?: string, callback: (res: number) => void})
{
	if (typeof(p.socket, Socket)) {
		return (p.socket as Socket).emit('client.create_channel', {
			name     : p.name,     // Mandatory string
			type     : p.type,     // Mandatory number
			password : !p.password ? undefined : p.password, // Optional string
		}, p.callback);
	}
}

function createOrGetDMChannel(p: {socket: Socket | {}, other_login: string, callback: (res: number) => void})
{
	if (typeof(p.socket, Socket)) {
		return (p.socket as Socket).emit('client.create_channel', {
			type: ChannelStatus.directMessage,
			other_login: p.other_login
		}, p.callback);
	}

	// Example callback:
	// ```
	// callback(res) {
	// 	if (res) {
	// 		navigate(`/channelchat/${res}`)
	// 	} else {
	// 		setError('Couldn\'t create channel');
	// 	}
	// }
	// ```
	//alert("Channel created")
}

//// =================================================================
//// ------------------------ Joining Channel ------------------------
//// =================================================================
function joinChannel(p: {socket: Socket, id: number, password?: string, callback: (res: boolean) => void}){
	p.socket.emit('client.join_channel', {
		id       : p.id,      // Mandatory number
		password : p.password, // Optional  string
	}, p.callback);
}
//// =================================================================
//// ------------------ Sending message to channel -------------------
//// =================================================================
function sendMessageToChannel(p)	{
	p.socket.emit('client.message', {
		room    : p.room,   // Mandatory number
		content : p.content // Mandatory string
	})
}

//// =================================================================
//// ------------------------- Blocking user -------------------------
//// =================================================================
function blockUser(p: { socket: Socket | {}, id: number, callback: () => void }){
	(p.socket as Socket).emit('client.block_user', {
		id : p.id // Mandatory number
	}, p.callback );
}

//// ================================================================
//// ----------------------- Unblocking User ------------------------
//// ================================================================
function unblockUser(p: { socket: any; id?: any; callback : () => void}){
	(p.socket as Socket).emit('client.unblock_user', {
		id : p.id // Mandatory number
	}, p.callback);
}

//// =================================================================
//// ------------------------ Leaving Channel ------------------------
//// =================================================================
function leaveChannel(p:{
	socket: Socket | {},
	channel_leave: number,
	callback:   () => void
}) {
	(p.socket as Socket).emit('client.leave_channel', {
		id : p.channel_leave,  // Mandatory number
	}, p.callback);
}



// =============================================================================
// ---------------------------------- CHANOPS ----------------------------------
// =============================================================================
function addToChannel(p: {socket: Socket | {}, channel_id: number, user_id: string, callback: () => void})
{
	(p.socket as Socket).emit('client.add_to_channel', {
		channel_id : p.channel_id, // Mandatory number
		user_id    : p.user_id,    // Mandatory number
	}, p.callback)
}

function banFromChannel(p: {
	socket: Socket | {},
	channel_id: number,
	user_id: string,
	time: number,
	callback:   () => void
}) {
	(p.socket as Socket).emit('client.ban_from_channel', {
		channel_id : p.channel_id, // Mandatory number
		user_id    : p.user_id,    // Mandatory number
		time       : p.time        // Mandatory number
	}, p.callback)
}

function unbanFromChannel(p: {
	socket:     Socket | {},
	channel_id: number,
	user_id:    string,
	callback:   () => void
}) {
	(p.socket as Socket).emit('client.unban_from_channel', {
		channel_id : p.channel_id, // Mandatory number
		user_id    : p.user_id,    // Mandatory number
	}, p.callback)
}

function muteInChannel (p: {
	socket:     Socket | {},
	channel_id: number,
	user_id:    string,
	time:       number,
	callback:   () => void
}) {
	(p.socket as Socket).emit('client.mute_in_channel', {
		channel_id : p.channel_id, // Mandatory number
		user_id    : p.user_id,    // Mandatory number
		time       : p.time        // Mandatory number
	}, p.callback)
}

export function unmuteInChannel (p: {
	socket:     Socket | {},
	channel_id: number,
	user_id:    string,
	callback:   () => void
}){
	(p.socket as Socket).emit('client.unmute_in_channel', {
		channel_id : p.channel_id, // Mandatory number
		user_id    : p.user_id,    // Mandatory number
	}, p.callback)
}

export function changeName(p: {
	socket:     Socket | {},
	channel_id: number,
	new_name  : string,
	callback:   () => void
}){
	(p.socket as Socket).emit('client.change_name', {
		channel_id : p.channel_id, // Mandatory number
		new_name   : p.new_name,   // Mandatory number
	}, p.callback)
}



function changeChannelVisibility(p : {
	socket:     Socket | {},
	channel_id: number,
	new_visibility : number,
	password : string,
	callback:   () => void
})
{
	(p.socket as Socket).emit('client.change_visibility', {
		channel_id     : p.channel_id,     // Mandatory number
		new_visibility : p.new_visibility, // Mandatory number (enum)
		password       : p.password        // Optional password
	}, p.callback)
}

function promoteToChanOP(p: {
	socket:     Socket | {},
	channel_id: number,
	user_id:    string,
	callback:   () => void
}) {
	(p.socket as Socket).emit('client.to_chanop', {
		channel_id : p.channel_id, // Mandatory number
		user_id    : p.user_id,    // Mandatory number
	}, p.callback)
}

function demoteFromChanOP(p: {
	socket:     Socket | {},
	channel_id: number,
	user_id:    string,
	callback:   () => void
}) {
	(p.socket as Socket).emit('client.to_user', {
		channel_id : p.channel_id, // Mandatory number
		user_id    : p.user_id,    // Mandatory number
	}, p.callback)
}


export {
	unbanFromChannel,
	joinQueueRandomGame,
	createChannel,
	createOrGetDMChannel,
	joinChannel,
	sendMessageToChannel,
	blockUser,
	unblockUser,
	leaveChannel,
	// OPERATOR EXCLUSIVE
	promoteToChanOP,
	demoteFromChanOP,
	changeChannelVisibility,
	muteInChannel,
	banFromChannel,
	addToChannel
}
