

import * as u from "@/utils/utils"
import img_goBack   from '@/assets/square_chev_left.svg'
import img_settings from '@/assets/settings.svg'
import Frame        from '@/components/Frame'
import {motion, AnimatePresence} from 'framer-motion'
import {useLocation} from "react-router"
import { useNavigate } from "react-router"
import { useContext, useState } from "react"
import { useEffect } from "react"
import axios from "axios"
import { UserBlock } from "@/src/main"
// =============================================================================
// ----------------------------------- TYPES -----------------------------------
// =============================================================================
export  type Msg = {
	login : string,
	message: string,
	sender_id: number,
	picture: string,
	timestamp: Date,
	username: string,
	is_notice: boolean
}

export type messageArray        = { msgs? : Msg[]; }
export type MessageBubbleParams = {
	text?     : string;
	children? : React.ReactNode;
}

// =============================================================================
// --------------------------------- FUNCTIONS ---------------------------------
// =============================================================================

// ---------------------------------------------------------
// ---------------------- Auto scroll ----------------------
// ---------------------------------------------------------
export const scrollToBottom = async () => {
	const timeout = (delay: number) => new Promise( res => {setTimeout(res, delay)} )
	await timeout(300) // This timeout is used to delay the scroll because it happens before the last message is rendered
	const element = document.getElementById("anchor");
	element?.scrollIntoView({behavior: "smooth"});
}

// =============================================================================
// -------------------------------- PAGE FRAME ---------------------------------
// =============================================================================
export const ChatFrame = (p:any) => {
	//const location = useLocation();
	//const data = location.state?.data;
	const [chanName, setChanName] = useState()
	const [chan, setChan] = useState()
	useEffect(()=>{
		axios.get(`${import.meta.env.VITE_BACK_URL}/channel/${p.channel_id}`)
		.then(res => {
			let current_channel = res.data;
			if (current_channel.name == null) {
				if (current_channel.users.length === 1) {
					if (current_channel.users[0])
					current_channel.name = current_channel.users[0].displayName;
				}
				else
					current_channel.name = u.getCurrentUser() == current_channel.users[0].login ? current_channel.users[1].displayName : current_channel.users[0].displayName
			}
			setChanName(current_channel.name)
			setChan(current_channel)
		}).catch(err=>console.log(err))
	}, [])


	const location = useLocation();
	const data = location.pathname.split('/')[2];
	return (
		<Frame
			title         = {chanName}
			modalTitle	  = {chan}
			jcsa          = {true}
			chat          = {true}
			titleImgLeft  = {img_goBack}
			hrefLeft      ={'/landing'}
			titleImgRight = {img_settings}
			hrefRight     = {`/channelchat/${p.channel_id}/settings`}
			data          = {{base: {}, TchatFchannel: false, name:"Chat de thibaut", bool:false}}
		>
			{p.children}
		</Frame>
	)
}


// =============================================================================
// --------------------------- ALL MESSAGES DISPLAY ----------------------------
// =============================================================================
export function AllMessages(p:messageArray) {
	const navigate = useNavigate()
	const userBlock = useContext(UserBlock)

	// =========================================================================
	// Declaring HTML elements
	// =========================================================================
	const url = "https://pluspng.com/img-png/png-user-icon-circled-user-icon-2240.png"
	const MessageFrame    = (p:{children: JSX.Element[], login?: string, key: number}) => {
		if (!p.login) {
			return (
				<motion.div
					className="flex w100 col"
					style={{
						paddingBottom:"10px"
					}}>
					{p.children}
				</motion.div>
			)
		}
		return (
		<motion.div
			whileHover={{opacity:0.6}}
			className="flex w100 col"
			onClick={()=>navigate("/userpage/" + p.login)}
			style={{
				cursor:"pointer",
				paddingBottom:"10px"
			}}>
			{p.children}
		</motion.div>
	)}
	const MessageImage    = (p:any) => { return ( <img src={p.image?p.image:url} className="bgblack1 flex center" style={{margin:"2px 10px 0 2px", minWidth:"30px", width:"30px", height:"30px", borderRadius:360}}/> ) }
	const MessageTime     = (p:any) => { return ( <div className="Roboto flex w100" style={{color:"#666666", flexDirection:"row-reverse", fontSize:"12px"}}>{p.timestamp.toLocaleString()}</div> )}
	const MessageUserName = (p:any) => { return ( <div className="Roboto flex w100" style={{color:"#666666", flexDirection:"row", fontSize:"12px"}}>{p.username}</div> )}
	const MessageContent = (p:any) => { return (
		<div className="flex grow h100"
			style={{
				backgroundColor : p.sender_id === u.getCurrentUserId() ? "#EBCB8B" : "#cccccc",
				borderRadius : 10,
				padding      : "5px",
				wordWrap     : "break-word"}}>
			<MessageImage image={p.image}/>
			<p className="flex aic Roboto" style={{wordBreak:"break-all"}}>
				{p.message}
			</p>
		</div>
	)}
	const NoticeMessage = (p:any) => { return (
		<div className="flex grow h100"
			style={{
				backgroundColor : "#dcbfff",
				borderRadius : 10,
				padding      : "5px",
				textAlign: "center",
				wordWrap     : "break-word"}}>
			<p className="aic Roboto" style={{wordBreak:"break-all",
				textAlign: "center",
				width: "100%"}}>
				{p.message}
			</p>
		</div>
	)}

	// =========================================================================
	// This array will contain all <SingleMessage> elements
	// =========================================================================
	let arrayOfMessageComponents : JSX.Element[] = []

	// =========================================================================
	// --------------- - Return "No Messages" if array is empty ----------------
	// =========================================================================
	if (p.msgs === undefined || p.msgs.length === 0) {
		arrayOfMessageComponents.push(
			<div key={-1} className="PixelSaga flex fill col center">NO MESSAGES</div>
		)
	}

	// =========================================================================
	// Generating message components from the msgs:string[] array
	// =========================================================================
	else {
		for (let i = 0; i < p.msgs.length; i++) {

			if (p.msgs[i].is_notice) {
				arrayOfMessageComponents.push(
					<MessageFrame key={i}>
						<NoticeMessage message={p.msgs[i].message}/>
						<MessageTime timestamp={p.msgs[i].timestamp}/>
					</MessageFrame>
				)
			} else {
				let login  = p.msgs[i].login;
				let sender_id = p.msgs[i].sender_id;
				let message = p.msgs[i].message;
				let image = p.msgs[i].picture;
				let timestamp = p.msgs[i].timestamp;
				let username = p.msgs[i].username;
				// useEffect(() => {
				if (userBlock.value.has(sender_id)) {
					message = username + ' is blocked!'
				}
				// }, [])
				arrayOfMessageComponents.push(
					<MessageFrame key={i} login={login}>
						<MessageUserName username=""/>
						<MessageContent image={image} message={message} sender_id={sender_id}/>
						<MessageTime timestamp={timestamp}/>
					</MessageFrame>
				)
			}
		}
	}

	return (
		<div className="h80 flex relative">
			<div
				id        = "messages"
				className = "flex col fill hideScrollBar absolute"
				style     = {{overflowX :"auto" }}
			>
				{arrayOfMessageComponents}
				{/* This anchor is invisible, it is the target to scroll to (bottom div in the message section)*/}
				<div id="anchor"/>
			</div>
			</div>
	)
}

