import React, {useEffect} from "react"
import { useContext } from "react"
import {ChatSocket} from '../../main'
import axios from 'axios'
import { useState } from "react"
import * as socket from '../utils/socket'

let chatSocket; // chatSocket
let rr;     // rerender state
let srr;    // rerender setState
// =============================================================================
// ----------------------------------- MAIN ------------------------------------
// =============================================================================
function Tests()
{
	const FRAME = (p) => { return <div className="flex fill" style={{overflow:"scroll"}}>{p.children}</div> }
	const COL   = (p) => { return <div className="flex fill col">{p.children}</div> }

	const [rerender, setRerender] = useState(false);
	rr         = rerender;
	srr        = setRerender;
	chatSocket = useContext(ChatSocket)

	axios.get(`${import.meta.env.VITE_BACK_URL}/channel`, {withCredentials:true})
	.then(res=>console.log(res.data))
	.catch(error=>alert(error))

	return (
		<FRAME>
			<COL>
				<h2>TESTS</h2>
				<MultiLine/>
				{/* ======================================================== */}
				{/* ---------------- CHANNEL CREATION TESTS ---------------- */}
				{/* ======================================================== */}
				<Test
					title    = {"Create channel Thibaut"}
					method   = {socket.createChannel}
					name     = {"Hello"}
					type     = {0}
				/>
				<Test
					title    = {"Create channel Emma"}
					method   = {socket.createChannel}
					name     = {"Emma Type 1"}
					type     = {1}
					password = {"123"}
				/>
				<Test
					title    = {"Create channel Thibaut"}
					method   = {socket.createChannel}
					name     = {"Thib Type 2"}
					type     = {2}
					password = {"12345"}
				/>
				<Test
					title    = {"Create channel"}
					method   = {socket.createChannel}
					name     = {"Emma Type 2"}
					type     = {2}
					password = {"12345"}
				/>
				{/* ======================================================== */}
				{/* ------------------ CHANNEL JOIN TEST ------------------- */}
				{/* ======================================================== */}
				<Test
					title    = {"Join channel"}
					method   = {socket.joinChannel}
					id       = {1}
					password = {"12345"}
				/>
				<Test
					title    = {"Join chan invalid password"}
					method   = {socket.joinChannel}
					id       = {1}
					password = {"jambon"}
				/>
				{/* ======================================================== */}
				{/* --------------- SEND MESSAGE TO CHANNEL ---------------- */}
				{/* ======================================================== */}
				<Test
					title    = {"Send message"}
					method   = {socket.sendMessageToChannel}
					room     = {1}
					content  = {"Hello world"}
				/>
				{/* ======================================================== */}
				{/* ---------------------- BLOCK USER ---------------------- */}
				{/* ======================================================== */}
				<Test
					title    = {"Block User"}
					method   = {socket.blockUser}
					user_id  = {1}
				/>
				{/* ======================================================== */}
				{/* --------------------- UNBLOCK USER --------------------- */}
				{/* ======================================================== */}
				<Test
					title    = {"UNBlock User"}
					method   = {socket.unblockUser}
					user_id  = {1}
				/>
				{/* ======================================================== */}
				{/* --------------------- LEAVECHANNEL --------------------- */}
				{/* ======================================================== */}
				<Test
					title         = {"leave channel"}
					method        = {socket.leaveChannel}
					channel_leave = {1}
				/>
				{/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||| */}
				{/* ----------------------- CHANOPS ------------------------ */}
				{/* |||||||||||||||||||||||||||||||||||||||||||||||||||||||| */}
				{/* ======================================================== */}
				{/* ------------------------ INVITE ------------------------ */}
				{/* ======================================================== */}
				<Test
					title      = {"Invite to channel"}
					method     = {socket.addToChannel}
					channel_id = {1}
					user_id    = {1}
				/>
				{/* ======================================================== */}
				{/* ------------------------- BAN -------------------------- */}
				{/* ======================================================== */}
				<Test
					title      = {"Ban from channel"}
					method     = {socket.banFromChannel}
					channel_id = {1}
					user_id    = {1}
					time       = {1234}
				/>
				{/* ======================================================== */}
				{/* ------------------------- MUTE ------------------------- */}
				{/* ======================================================== */}
				<Test
					title      = {"Mute from Channel"}
					method     = {socket.muteInChannel}
					channel_id = {1}
					user_id    = {1}
					time       = {1234}
				/>
				{/* ======================================================== */}
				{/* -------------- CHANGE CHANNEL VISIBILITY --------------- */}
				{/* ======================================================== */}
				<Test
					title          = {"Channel visibility"}
					method         = {socket.changeChannelVisibility}
					channel_id     = {1}
					new_visibility = {1}
					password       = {"12345"}
				/>
				{/* ======================================================== */}
				{/* ----------------- PROMOTE TO OPERATOR ------------------ */}
				{/* ======================================================== */}
				<Test
					title      = {"Promote to operator"}
					method     = {socket.promoteToChanOP}
					channel_id = {1}
					user_id    = {1}
				/>
			</COL>
			{/* ============================================================ */}
			{/* ------------------ DISPLAYS INFO FROM DB ------------------- */}
			{/* ============================================================ */}
			<COL>
				<h2>DATA IN DB</h2>
				<MultiLine/>
				{listCreatedChannels()}
				<MultiLine/>
				<MultiLine/>
				<Button p={{method:refreshed, text:"Refresh"}} />
			</COL>

		</FRAME>
	)
}

// =============================================================================
// ----------------------------------- UTILS -----------------------------------
// =============================================================================
function Line(){return (<hr style={{backgroundColor:"black"}}/>)}
function MultiLine(){return (<><Line/><Line/><Line/><Line/><Line/></>)}
function refreshed() {alert("Fresh refresh")}


// =============================================================================
// This button build the request to socket with the appropriate parameters
// then sends it on click
// =============================================================================
const Button = (props:{p:{
	method         : any,
	text?          : string,
	id?            : number,
	name?          : string,
	type?          : number,
	password?      : string,
	room?          : number,
	content?       : string,
	user_id?       : number,
	channel_leave? : number,
	channel_id?    : number,
	time?          : number,
	new_visibility?: number
}}) => {
	const p = props.p;
	let functionParams = {};
	Object.assign(
		functionParams,
		{socket      : chatSocket},
		p.text           ? { text           : p.text           } : {},
		p.id             ? { id             : p.id             } : {},
		p.name           ? { name           : p.name           } : {},
		p.type           ? { type           : p.type           } : {},
		p.password       ? { password       : p.password       } : {},
		p.room           ? { room           : p.room           } : {},
		p.content        ? { content        : p.content        } : {},
		p.user_id        ? { user_id        : p.user_id        } : {},
		p.channel_leave  ? { channel_leave  : p.channel_leave  } : {},
		p.channel_id     ? { channel_id     : p.channel_id     } : {},
		p.time           ? { time           : p.time           } : {},
		p.new_visibility ? { new_visibility : p.new_visibility } : {},
	)
	return (
		<div
			className="flex center"
			onClick={()=>{
				p.method(functionParams)
				srr(!rr); // NOTE : triggers a single rerender
			}}
			style={{
				cursor          : "pointer",
				backgroundColor : "#fabd2f",
				border          : "1px solid black",
				width           : "200px",
				margin          : "10px"}}
		>
			{p.text?p.text:"Send"}
		</div>
	)
}

// =============================================================================
// This component shows the parameters of the websocket query that will be sent
// after clicking on the button
// =============================================================================

{/* <Test
title    = {"Join channel"}
method   = {socket.joinChannel}
id       = {1}
password = {"12345"}
/> */}
const Test = (p) => {
	return (
		<>
			<h2>{p.title}</h2>
			<Line/>
			{Object.keys(p).map((keyName, i) => (
				<div key={i}>
					{
						keyName === "socket" || keyName === "title" || keyName === "method"
							? <div key={i}></div>
							: <span key={i}>{keyName}: {p[keyName]}</span>
					}
				</div>
			))}
			<Button p={p}/>
			<MultiLine/>
		</>
	)
}



// =============================================================================
// ---------------------------------- GETTERS ----------------------------------
// =============================================================================
function listCreatedChannels()
{
	const [array, setArray] = useState<JSX.Element[]>([])
	useEffect(()=>{
		axios.get(`${import.meta.env.VITE_BACK_URL}/channel`, {withCredentials:true})
		.then(res=>{
			console.log(res.data)
			let a :  JSX.Element[] = [];
			a.push(<div key={-1}><h2>All Channels List</h2><Line/></div>)
			if (res.data.length === 0)
				a.push(<p key={-2}>Empty</p>)
			for (let i = 0; i < res.data.length; i++){
				a.push(<p key={i}>
					{res.data[i].id}&nbsp;
					{res.data[i].name}&nbsp;
					{res.data[i].type}&nbsp;
					{res.data[i].password}
				</p>)
			}
			setArray(a)
		})
		.catch(err=>{alert(err)})
	}, [rr])

	return array;
}

function listAllMessages()
{
	const [array, setArray] = useState<JSX.Element[]>([])
	useEffect(()=>{
		axios.get(`${import.meta.env.VITE_BACK_URL}/chat/messages`, {withCredentials:true})
		.then(res=>{
			console.log(res.data)
			let a :  JSX.Element[] = [];
			a.push(<div key={-1}><h2>All Messages List</h2><Line/></div>)
			if (res.data.length === 0)
				a.push(<p key={-2}>Empty</p>)
			for (let i = 0; i < res.data.length; i++){
				a.push(<p key={i}>
					{res.data[i].id}&nbsp;
					{res.data[i].name}&nbsp;
					{res.data[i].type}&nbsp;
					{res.data[i].password}
				</p>)
			}
			setArray(a)
		})
		.catch(err=>{alert(err)})
	}, [rr])
	return array;
}

export default Tests
