
// =============================================================================
// ---------------------------------- IMPORT -----------------------------------
// =============================================================================
import React, { useState, useEffect, PropsWithChildren } from "react"
import Frame from "../components/Frame"
import Cell  from "../components/Cell"
// import Anim from '../components/Header'
import {motion} from 'framer-motion'
import {useNavigate } from "react-router-dom";
import {AllMessagesContainer, SmallButton, ButtonsChannelFriends, Add } from '../components/template'

import { useContext } from "react"
import {ChatSocket} from '../../main'
import { Socket } from "socket.io-client";
import * as socket from '../utils/socket'
import axios from 'axios'
import * as utils  from '../utils/utils'
import square_question from '@/assets/square_question.svg'
import { useMediaQuery } from "react-responsive";


let chatSocket:any ; // chatSocket
let rr:any;     // rerender state
let srr:any;    // rerender setState
let navigate : any;

type link = {
	title: string,
	color: string,
	bool:boolean,
	data?: any,
	href?: string,
	idFriend?:number
}

type animButton = PropsWithChildren<{
	href?:string,
	data?:any,
	bool?:boolean,
	friend?:boolean,
	idFriend?: number
}>


const Button = (p:{
	handleClick    : any,
	socket         : any,
	text?          : string,
	id?            : number,
	name?          : string,
	type?          : number,
	password?      : string,
	room?          : number,
	content?       : string,
	user_id?       : number,
	channel_leave? : number
}) => {
	let functionParams = {};
	Object.assign(
		functionParams,
		{handleClick : p.handleClick},
		{socket      : p.socket     },
		p.text          ? { text          : p.text          } : {},
		p.id            ? { id            : p.id            } : {},
		p.name          ? { name          : p.name          } : {},
		p.type          ? { type          : p.type          } : {},
		p.password      ? { password      : p.password      } : {},
		p.room          ? { room          : p.room          } : {},
		p.content       ? { content       : p.content       } : {},
		p.user_id       ? { user_id       : p.user_id       } : {},
		p.channel_leave ? { channel_leave : p.channel_leave } : {},
	)
	return (
		<div
			className="flex center"
			onClick={()=>{
				p.handleClick(functionParams);
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
// ----------------------------------- UTILS -----------------------------------
// =============================================================================

const AddUser  = () => <Cell margin="0 0 10px 0" minHeight="50px" width="100%" color="bggrey8">CHANNEL NAME </Cell>

// =============================================================================
// --------------------------------- CHANNELS ----------------------------------
// =============================================================================
const Anim 		= (p:animButton) => {
	let style = {cursor:'pointer', width:'', minHeight:''}
	if (!p.data.bool) {style.width='49%'; style.minHeight='80%';}
	return (
		(p.friend) ?
		<motion.div className="center" style={style} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
		onClick={() => navigate(p.href+'/'+p.idFriend)} >{p.children}</motion.div> :
		<motion.div className="center" style={style} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
		onClick={() => navigate(p.href+'/'+p.data.channel_id, {state : {data : p.data}})} >{p.children}</motion.div>
	)
}

enum ChannelStatus {
	public,
	password,
	private,
	directMessage // Special mode: both user are chanops, neither can add other people to the discussion
}


const ChanButton  = (p:link) => {

	const phone = useMediaQuery({maxWidth:760})
	let element : JSX.Element =<></>;
	switch (p.data.type) {
		case ChannelStatus.public:
		  	element = <p>public</p>
			break ;
		case ChannelStatus.password:
			element = <p>password</p>
			break ;
			case ChannelStatus.private:
			element = <p>private</p>
			break ;
			case ChannelStatus.directMessage:
			element = <p>direct-Message</p>
			break ;
		}

	if (!p.bool) {
		let obj = {
			data : p.data,
			bool : true
		}
		return (
			<Anim href={p.href} idFriend={p.idFriend} data={obj} friend={true}>
				<Cell margin="0 0 10px 0" minHeight="50px" width="100%" color={p.color}>
					{p.title}
				</Cell>
			</Anim>
		)
	}
	return (
		<Anim href='/channelchat' data={p.data} bool={p.data.bool}>
			<Cell margin="0 0 10px 0" minHeight="50px" width="100%" color={p.color}>
				<div className="w70 center">
				<div className="w30"/>
				<div className="w40 center" style={{fontSize: phone ? '10px' : '15px'}}>{p.title}</div>	
				</div>
				<div className="w30" style={{textAlign:'end', fontSize: phone ? '8px' : '10px', opacity:0.5, margin:'0 35px 0 0'}}>{element}</div>
			</Cell>
		</Anim>
	)
}
function Channels(p: { data:Chan[]; })
{
	let a :  JSX.Element[] = [];
	let i:number;
	for (i = 0; i < p.data.length && p.data[i].channel_id !== null ; i++){
		p.data[i].TchatFchannel = false;
		p.data[i].bool = true;

		let color : string = '';
		if (p.data[i].type === 0) {color = 'public'} else if (p.data[i].type === 1) {color = 'password'}
		else if (p.data[i].type === 2) {color = 'private'} else if (p.data[i].type === 3) {color = 'dm'}
		// console.log("Yo " + JSON.stringify(p.data[i]));
		if (p.data[i].name == null) {
			if (p.data[i].users.length === 1) {
				if (p.data[i].users[0])
					p.data[i].name = p.data[i].users[0].display_name;
			}
			else 
				p.data[i].name = p.data[i].users[0].login == utils.getCurrentUser() ? p.data[i].users[1].display_name : p.data[i].users[0].display_name;
		}
		a.push(<ChanButton bool={true} title={p.data[i].name} color={color} data={p.data[i]} key={i}/>)
	}
	a.push(<Add title="Add Channel" href="/allchannel" key={i}/>)
	a.push(<Add title="Create channel" href="/createchannel" key={i + 1}/>)
	return (
			<AllMessagesContainer>
				<div className="flex col h90 w100">{a}</div>
			</AllMessagesContainer>
	)
}

function TestCreateChannel(p:{
	name     : string,
	type     : number,
	password : string
}) {
	return (
		<>
			<h2>Create a channel</h2>
			name     : {p.name}<br/>
			type     : {p.type}<br/>
			password : {p.password}
			<Button
				socket = {chatSocket}
				handleClick = {socket.createChannel}
				name        = {p.name}
				type        = {p.type}
				password    = {p.password}
			/>
		</>
	)
}


// =============================================================================
// ---------------------------------- BUTTONS ----------------------------------
// =============================================================================
function refreshed() {alert("Fresh refresh")}

// =============================================================================
// ----------------------------------- MAIN ------------------------------------
// =============================================================================

function TestChannel() {
	axios.get(`${import.meta.env.VITE_BACK_URL}/user/me/channels`,  {withCredentials: true})
	.then((res)=> {console.log(res.data)})
	.catch((err)=>{console.log("ERROR")})
	return (
		<div id="testChannel">
			<>Hello</>
		</div>
	)
}

const getAllChannel = () => {
	axios.get(`${import.meta.env.VITE_BACK_URL}/channel`, {withCredentials:true})
	.then (res => {
		console.log('All channels : ')
		console.log(res.data);
	})
}


interface User {
	id 				: 	number,
	login 			: 	string,
	display_name 	: 	string
}

interface Chan {
	channel_id:number,
	name:string,
	users : Array<User>,
	type: number,
	TchatFchannel : boolean,
	bool : boolean
}

function ChannelSelectionPage()
{
	const [myChannel, setMyChannel] = useState<Chan[]>([]);

	useEffect(() => {
		axios.get(`${import.meta.env.VITE_BACK_URL}/user/me/channels`, {withCredentials:true})
		.then (res => {
			setMyChannel(res.data)
		})
	}, [])
	const [rerender, setRerender] = useState(false);
	rr = rerender;
	srr = setRerender;


	chatSocket = useContext(ChatSocket)
	// console.log(ChatSocket)

	navigate  = useNavigate()

	if (!myChannel) return <Frame/>

	return(
		<Frame title="Channel Page" jcsb={false}>
			<div className="flex col h100 w100 relative">
				<Channels data={myChannel}/>
				{/* <TestChannel/> */}
				<ButtonsChannelFriends/>
			</div>
			{/* <Button
					socket = {chatSocket}
					handleClick={refreshed} text="refresh"/> */}
		</Frame>
	)
}

export default ChannelSelectionPage
