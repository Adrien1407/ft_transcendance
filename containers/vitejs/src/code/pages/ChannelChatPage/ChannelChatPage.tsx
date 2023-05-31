import React, { useContext, useEffect, useState, useRef} from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ChatSocket, UserBlock } from "@/src/main"
import axios, { AxiosError } from "axios"


import * as c      from './components'
import * as utils  from '@/utils/utils'
import * as socket from '@/utils/socket'
import sword from '@/assets/sword.svg'


import Pong from '@/components/pong/App'
import Frame from '@/components/Frame'
import {channel} from "diagnostics_channel"
import { Socket } from "socket.io-client"
import PongInterface from "../PongInterfaceGame"


// =============================================================================
// -------------------------------- CHAT SOCKET --------------------------------
// =============================================================================
function init_socket (channel_id:any, setMsgs:React.Dispatch<React.SetStateAction<c.Msg[]>>) {
	// =========================================================================
	// Listening to all server messages
	// =========================================================================
	const chatSocket : any = useContext(ChatSocket)
	useEffect(()=>{
		chatSocket.on("server.message", (arg:any)=>{
			// =================================================================
			// Updating displayed messages
			// =================================================================
			const msgData = {
				login     : arg.sender_login,
				message   : arg.content,
				sender_id : arg.sender_id,
				picture   : arg.sender_picture_link,
				username  : arg.sender_display_name,
				timestamp : new Date(arg.timestamp ).toLocaleString(),
				is_notice: false
			}
			//if (arg.sender_id !== utils.getCurrentUserId())
			if (arg.room === channel_id) {
				setMsgs(existingMsgs => [...existingMsgs,msgData]);
				c.scrollToBottom()
			}
		})
		chatSocket.on("server.channel_game", (arg: {content: string, room: number})=>{
			// =================================================================
			// Updating displayed messages
			// =================================================================
			console.log("Gogo" + arg)
			const msgData: c.Msg = {
				login    : "",
				message  : arg.content,
				sender_id: 0,
				picture  : "",
				username : "",
				timestamp: new Date(),
				is_notice: true
			}
			//if (arg.sender_id !== utils.getCurrentUserId())
			if (arg.room === channel_id) {
				setMsgs(existingMsgs => [...existingMsgs,msgData]);
				c.scrollToBottom()
			}
		})
		return (()=>{
			chatSocket.off("server.message")
			chatSocket.off("server.channel_game")
		})
	}, [])
}


// =============================================================================
// -------------------------------- GAME SOCKET --------------------------------
// =============================================================================
function init_game_socket(){

	const [chaussette, setChaussette] = useState<any>()
	useEffect(()=>{
		const gameSocket = socket.connectToGameSocket()
		setChaussette(gameSocket)
		return (()=>{
			console.log('GameSocket closed')
			gameSocket.off('connect')
			gameSocket.off('disconnect')
		})

	}, [])
	return chaussette;
}


// =============================================================================
// ----------------------------------- INPUT -----------------------------------
// =============================================================================
export function TextInput (p:{
	channel_id:any,
	setMsgs:React.Dispatch<React.SetStateAction<c.Msg[]>>,
	pong : boolean,
	setPong: React.Dispatch<React.SetStateAction<boolean>>,
	currentUserImage: string,
}) {
	const textRef = useRef<HTMLTextAreaElement>(null);
	const [charCount, setCharCount] = useState(0);



	function handleInput() {
	  if (textRef.current) {
		const size = textRef.current.value.length;
		if (textRef.current.value.trim() !== '\n' && textRef.current.value[size - 1] !== "\n")
			setCharCount(textRef.current.value.length);
	  }
	}
	// =========================================================================
	// Fetching main (global) socket from Context
	// =========================================================================
	const chatSocket : any = useContext(ChatSocket)
	function send_message (e:any) {
		if (e.key === "Enter") {


			// =================================================================
			// e.target.value contains the message sent
			// =================================================================
			const newMsg = e.target.value;
			if (newMsg.trim() === '') {
				e.target.value = "";
				setCharCount(0)
				return ;
			}
			const msgData = {
				login      : utils.getCurrentUser(),
				message   : newMsg,
				sender_id : utils.getCurrentUserId(),
				picture   : p.currentUserImage,
				timestamp : new Date(),
				username  : '',
				is_notice: false
			}
			// =================================================================
			// Pushing the new message to the back of the array
			// =================================================================
			p.setMsgs(existingMsgs => [...existingMsgs,msgData]);

			// =================================================================
			// Resetting input field
			// =================================================================
			e.target.value = "";

			// =================================================================
			// Sending message to channel socket
			// =================================================================
			const msg = {
				socket  : chatSocket,
				room    : p.channel_id,
				content : newMsg,
			}
			socket.sendMessageToChannel(msg);
			setCharCount(0)
			// =================================================================
			// Scroll to bottom of Message section
			// =================================================================
			c.scrollToBottom()
		}
	}
	type itemMute = {id:number, login:string, displayname:string, ban_time:string, }
	const [userMute, setUserMute] = useState<itemMute[]>([]);

	type UserType = {
		id: number;
		login: string;
		displayName: string;
	  };

	  type itemChan = {
		id: number;
		name: string | null;
		type: number;
		users: UserType[];
		owner: string | null;
	  };

	const [chanType, setChanType] = useState<itemChan | null>(null);
	useEffect(()=> {
		axios.get(`${import.meta.env.VITE_BACK_URL}/channel/${p.channel_id}/mute`)
		.then(res => {setUserMute(res.data)})
		axios.get(`${import.meta.env.VITE_BACK_URL}/channel/${p.channel_id}`, {withCredentials:true})
		.then (res => {setChanType(res.data);})
	}, [])

	let aloneUser :string = '';

	if (chanType && chanType.type === 3) {
		if (chanType.users.length === 1) {
			aloneUser = 'Your alone in this chat. You can quit this !'
		}
	}

	let verifMuteUser = false;
	let timeMuted = '';

	for (let i = 0; i < userMute.length; i++) {
		if (userMute[i].login === utils.getCurrentUser()) {
			verifMuteUser = true;
			timeMuted = new Date(userMute[i].ban_time).toLocaleString()
		}
	}
	return (
		<div className="flex row w100 relative jcsb" style={{boxSizing:"border-box",height:"20%", maxHeight:'20%', backgroundColor:"white", borderRadius:"10px", padding:"10px"}}>

			{verifMuteUser ?
			<div className="Roboto flex col w90 h100 center bggrey9" style={{
				border       :"0px none",
				outlineStyle :"none",
				resize       : 'none',
				overflow     : 'hidden',
				borderRadius : '10px'}}>
			<i>You have been mutted</i>
			<p style={{fontSize:'9px'}}>
				Remaining time : <i>{timeMuted}</i>
			</p>
			</div>
			:
			aloneUser !== '' ?
			<div className="Roboto flex col w90 h100 center bggrey9" style={{
				border       :"0px none",
				outlineStyle :"none",
				resize       : 'none',
				overflow     : 'hidden',
				borderRadius : '10px'}}>
			<i style={{fontSize:'9px'}}>{aloneUser}</i>
			</div>
			:
			<textarea
				ref={textRef}
				onInput={handleInput}
				maxLength={256}
				onKeyUp   = {(e)=>send_message(e)}
				className = "Roboto flex col w90 h100"
				style     = {{
					border       :"0px none",
					outlineStyle :"none",
					resize       : 'none',
					overflow     : 'hidden',
					borderRadius : '10px'}}
			/>
			}
			<div
				onClick={()=>{
					p.setPong(!p.pong);
					c.scrollToBottom()
				}}
				className="flex top right center"
				style={{width:"60px", height:"100%"
				}}>
				<img style={{
					backgroundColor: p.pong?"#EBCB8B":"",
					width        : "30px",
					height       : "30px",
					border       : "1px black solid",
					padding      : "10px",
					borderRadius : "10px"
					}} src={sword} alt=""/>
			</div>
			{/**
			   <div
			   onClick={()=>{
			   p.gameSocket.emit("client.ready")
			   }}
			   className="flex top right center"
			   style={{width:"60px", height:"100%"
			   }}>
			   <img style={{
width        : "30px",
height       : "30px",
border       : "1px black solid",
padding      : "10px",
borderRadius : "10px"
}} src={sword} alt=""/>
</div>
			  **/}
			<div className="absolute right" style={{fontSize:'10px'}}>{charCount}/256</div>
		</div>
	)
}

// =============================================================================
// ----------------------------------- MAIN ------------------------------------
// =============================================================================
function ChannelChatPage(){
	let navigate = useNavigate();
	const userBlock:any = useContext(UserBlock)

	// useEffect(() => {
	// 	axios.get(`${import.meta.env.VITE_BACK_URL}/user/me`, {withCredentials : true})
	// 	.then(res => setSenderUser(res.data));
	// }, [])

	const [currentUserImage, setCurrentUserImage] = useState("")
	useEffect(()=>{
		utils.getUserImage()
		.then(res=>setCurrentUserImage(res.data.picture))
		.catch(err=>console.log(err))
	}, [])
	//const location   = useLocation();
	const windowUrl = window.location.href;
	const channel_id = Number(windowUrl.split("/")[4])

	// =========================================================================
	// Locally saved messages to display
	// =========================================================================
	const [msgs, setMsgs]  = useState<c.Msg[]>([])
	useEffect(()=>{
		axios.get(`${import.meta.env.VITE_BACK_URL}/channel/${channel_id}/messages`)
		.then(res=>{
			const msgs = res.data
			if (msgs[0].created_at !== null)
				for (let i = 0; i < msgs.length; i++)
			{
				setTimeout(()=>{
					const msgData = {
						login : msgs[i].user_login,
						message   : msgs[i].content,
						sender_id : msgs[i].user_id,
						picture   : msgs[i].user_picture,
						username  : msgs[i].user_display_name,
						timestamp : new Date(msgs[i].created_at),
						is_notice: false
					}

					// =================================================================
					// Pushing the new message to the back of the array
					// =================================================================
					setMsgs(existingMsgs => [...existingMsgs,msgData]);

				},10)
			}
			c.scrollToBottom()
		})
		.catch((err: AxiosError) => {
			alert("Cannot access this channel.");
			navigate("/landing")
		})
	}, [])

	const [h, setH] = useState(0);
	const [w, setW] = useState(0);
	const ref = useRef<any>()
	useEffect(()=>{
		function handleResize() {
			if(ref.current){
				setH(ref.current.offsetHeight)
				setW(ref.current.offsetWidth)
			}
		}
		handleResize()
		console.log("Pong window height: " +h)
		console.log("Pong window width : " +w)
		//window.addEventListener('resize', handleResize);
		//return () => window.removeEventListener('resize', handleResize);
	})
	// =========================================================================
	// ----- This will init the socket and push new messages to msgs state -----
	// =========================================================================
	init_socket(channel_id, setMsgs)

	// =========================================================================
	// ---------------------------- PONG ACTIVATION ----------------------------
	// =========================================================================
	const [ pong, setPong ] = useState(false)
	//const gameSocket = init_game_socket();
	// =========================================================================
	// -------------------------- WINDOW SIZE HANDLER --------------------------
	// =========================================================================
	return (
		<c.ChatFrame channel_id={channel_id}>
			<div className={`w100 relative ${pong?"h40":"h100"}`}>
				<c.AllMessages msgs={msgs}/>
				<TextInput
					currentUserImage = {currentUserImage}
					channel_id = { channel_id }
					setMsgs    = { setMsgs    }
					pong       = { pong }
					setPong    = { setPong }
				/>

			</div>
			{ pong &&
			<div ref={ref} className="flex w100 center" style={{height:"57%"}}>
				{ w && h &&
				<PongInterface title="Channel game" id={channel_id}/>
				}
			</div>
			}
		</c.ChatFrame>
	)
}

export default ChannelChatPage
