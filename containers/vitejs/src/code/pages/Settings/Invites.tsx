import Frame from "@/components/Frame"
import * as utils from "@/utils/utils"
import * as sock from "@/utils/socket"
import axios from "axios"
import { useState } from "react"
import { useEffect } from "react"
import {motion, AnimatePresence} from 'framer-motion'
import goBack from '@/assets/square_chev_left.svg'
import {ChatSocket} from '@/src/main'
import { useContext } from "react"
import { useNavigate } from "react-router"

let channel_id : number;
let back_url : string;
let user_friends_url : string;
let settings_main : string;

function getUserFriends() {
	return axios.get(user_friends_url, {withCredentials:true})
}

function getMyChannels() {
	return axios.get(back_url+"/user/me/channels", {withCredentials:true})
}

const Container= ({children}:any) => {
	return (
		<div className="flex col h100 w100 relative">
			<div
				id        = "messages"
				className = "flex col w100 hideScrollBar absolute"
				style     = {{
					height    : "100%",
					maxHeight : "100%",
					overflowX : "auto"
				}}
			>
				{children}
			</div>
		</div>
	)
}

function catch_empty_friendlist(friends:any)
{
	if (friends.length === 0)
		return ;
	for (let i = 0; i < friends.length; i++){
		if (friends[i].id !== null)
			return ;
	}
	return 	 (
		<Frame title="Invited users" titleImgLeft={goBack} hrefLeft={settings_main}>
			<div className="flex fill center">
				No friends found
			</div>
		</Frame>
	)

}

function Cell (p:{login:string, userdisplayname:string, picture:string}) {
	const navigate = useNavigate()
	return (
		<motion.div
			whileHover={{opacity:0.5}}
			onClick={()=>{navigate("/userpage/"+p.login)}}
			className="flex center w90 jcsb"
			style={{
				cursor:"pointer",
				borderRadius:"10px",
				padding:"8px",
				backgroundColor:"#dddddd",
				margin :"0 0 10px 0"
			}}
		>
			<img src={p.picture} alt="" style={{marginRight:"10px",borderRadius:"360px", height:"40px"}}/>
			{p.userdisplayname}
			<div/>
		</motion.div>
	)
}

function Button (p:{already_in_channel:boolean,user_id: string,b?:boolean, noMargin?:boolean, fill?:boolean, onClickAction?:any, leave?:string}) {

	const chatSocket         = useContext(ChatSocket)
	const [color, set_color] = useState("")
	const [text, set_text]   = useState("")

	function invite_to_channel() {
		sock.addToChannel({
			socket:chatSocket,
			channel_id : channel_id,
			user_id : p.user_id,
			callback() {
				set_color("#A3BE8C")
				set_text("Invited")
			}
		})
	}

	useEffect(()=>{
		if (p.already_in_channel) {
			set_color("#A3BE8C")
			set_text("Invited")
		}
		else {
			set_color("#EBCB8B")
			set_text("Invite")
		}

	}, [p.already_in_channel])

	return (
		<motion.div className={`flex center tac ${p.fill?"w90":""}`}
			initial={true}
			onClick={()=>{invite_to_channel()}}
			whileTap={{x:"-3px", y:"3px", boxShadow:"-1px 1px 0px 0px"}}
			style={{
				minWidth:"100px",
				height:"48px",
				borderRadius:"10px",
				border:"1px solid black",
				padding:"10px",
				boxSizing:"border-box",
				boxShadow:"-3px 3px 0px 0px ",
				cursor:"pointer",
				backgroundColor:color,
				userSelect:"none",
				marginLeft:p.noMargin?"":"10px",
				marginBottom:p.b?"20px":""
			}}
		>
			{text}
			<div className="flex" style={{color:"white"}}>{p.leave}</div>
		</motion.div>
	)
}

const Bans = (p:any) => {
	channel_id       = utils.getCurrentRoomId()
	back_url         = import.meta.env.VITE_BACK_URL
	user_friends_url = back_url + "/user/me/friends"
	settings_main    = "/channelchat/" + channel_id + "/settings"


	const [friends, set_friends] = useState<any>([])
	const [channel_users, set_channel_users] = useState<any>([])
	useEffect(()=>{
		getUserFriends()
		.then(res=>{set_friends(res.data)})
		.catch(err=>{console.log(err)})

		getMyChannels()
		.then(res=>{
			const channels = res.data
			for (let i = 0; i < channels.length; i++) {
				if (channels[i].channel_id === channel_id) {
					set_channel_users(channels[i].users)
				}
			}
		})
		.catch((res)=>console.log(res))

	}, [])

	function isUserInChannel(login:string){
		for (let i = 0; i < channel_users.length; i++){
			if (login === channel_users[i].login){
				return true;
			}
		}
		return false;
	}

	const is_empty = catch_empty_friendlist(friends)
	if (is_empty) return is_empty;


	let array = [];

	for (let i = 0; i < friends.length; i++) {
		if (friends[i].id !== null) {
			const friend = friends[i]
			const picture = friend.picture
			const cell_text = friend.displayname;
			const user_id = friend.id
			const already_in_channel = isUserInChannel(friend.login)
			array.push(
				<div className="flex row w100 jcsb " key={i}>
					<Cell  login={friend.login} picture={picture} userdisplayname={cell_text}/>
					<Button
						already_in_channel = {already_in_channel}
						user_id = {user_id}
					/>
				</div>
			)
		}
	}

	return (

		<Frame title="Invite friend" titleImgLeft={goBack} hrefLeft={settings_main} chat={true}>
			<Container>
				{array}
			</Container>
		</Frame>
		)

}

export default Bans
