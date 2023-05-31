import axios from "axios";
import Frame from '@/components/Frame'
import goBack from '@/assets/square_chev_left.svg'
import * as utils from "@/utils/utils"
import {motion} from "framer-motion"
import * as mute from "./Muted"
import * as ban from "./Bans"
import * as chanops from "./Chanops"
import { useNavigate } from "react-router";
import { useMediaQuery } from "react-responsive";


const back_url         = import.meta.env.VITE_BACK_URL
const user_friends_url = back_url + "/user/me/friends"

// =============================================================================
// --------------------------------- FUNCTIONS ---------------------------------
// =============================================================================
export function getUserFriends() {
	return axios.get(user_friends_url, {withCredentials:true})
}

export function getMyChannels() {
	return axios.get(back_url+"/user/me/channels", {withCredentials:true})
}

export function getChannelUsers(channel_id : number)
{
	return axios.get(back_url+"/channel/"+channel_id+"/users", {withCredentials:true})
}

export function getMutedUsers(channel_id:number)
{
	return axios.get(back_url+"/channel/"+channel_id+"/mute", {withCredentials:true})
}

export function getBannedUsers(channel_id:number)
{
	return axios.get(back_url+"/channel/"+channel_id+"/ban", {withCredentials:true})
}

export function getChanops(channel_id:number)
{
	return axios.get(back_url+"/channel/"+channel_id+"/chanops", {withCredentials:true})
}



// =============================================================================
// --------------------------------- ELEMENTS ----------------------------------
// =============================================================================


// ---------------------------------------------------------
// ------------------- If list is empty --------------------
// ---------------------------------------------------------
export const Empty = (p:{channel_id:any, title:string}) => {
	const settings_main = "/channelchat/" + p.channel_id + "/settings"
	return 	(
		<Frame title={p.title} titleImgLeft={goBack} hrefLeft={settings_main} chat={true}>
			<div className="flex fill center">
				No users found
			</div>
		</Frame>
	)
}

// ---------------------------------------------------------
// -------------------- Standard frame ---------------------
// ---------------------------------------------------------
export const Container= ({children}:any) => {
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

// ---------------------------------------------------------
// ----------- User image + login + displayname -----------
// ---------------------------------------------------------
export const Cell = (p:{userdisplayname:string, picture:string, login:string}) => {
	const navigate = useNavigate();
	return (
		<div className="flex center w90 jcsb"
			onClick={()=>{navigate("/userpage/"+p.login)}}
			style={{
				cursor:"pointer",
				borderRadius:"10px",
				padding:"8px",
				backgroundColor:"#dddddd",
				margin :"0 0 10px 0"
			}}>
			<img src={p.picture} alt="" style={{marginRight:"10px",borderRadius:"360px", height:"40px"}}/>
			{p.userdisplayname}
			<div/>
		</div>
	)
}

// ---------------------------------------------------------
// -------------------- Cell generator ---------------------
// ---------------------------------------------------------
export const cellFactory = (users:any, time:any, type:string, banned? : boolean) => {
	let array = [];
	for (let i = 0; i < users.length; i++) {
		const user    = users[i]
		const picture   = user.picture
		const cell_text = user.displayname;
		const user_id   = user.id

		if (user.login !== null) {
			if (user.login !== utils.getCurrentUser()){
				array.push(
					<div className="flex row w100 jcsb " key={i}>
						<Cell login={users[i].login}  picture={picture} userdisplayname={cell_text}/>
						{type === "mute" &&  <mute.MuteButton type={type} time={time} user_id={user_id}/>}
						{type === "ban" &&  <ban.BanButton time={time} user_id={user_id} isBanned={banned}/>}
						{type === "chanops" &&  <chanops.ChanopsButton time={time} user_id={user_id}/>}
					</div>
				)
			}
		}
	}
	return array;
}

// ---------------------------------------------------------
// ---------------- The button HTML element ----------------
// ---------------------------------------------------------
export const ButtonElement = (p:{color:string, onClick:any,value:string}) => {
	return (
		<motion.div className={`flex center tac`}
			initial={true}
			onClick={p.onClick}
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
				backgroundColor:p.color,
				userSelect:"none",
				marginLeft:"10px",
				marginBottom:""
			}}
		>
			{p.value}
		</motion.div>
	)
}

// ---------------------------------------------------------
// ---------------------- Time input -----------------------
// ---------------------------------------------------------
export const CellTime = (p:any) => {
	const iphone = useMediaQuery({maxWidth:450});
	return (
		<div key={-1} className="flex w100 center"
			style={{
				boxSizing:"border-box",
				border:"1px solid black",
				marginBottom: "10px",
				height:"50px",
				borderRadius:"10px",
				backgroundColor:p.color,
				fontSize : iphone ? '11px' : ''
			}}>
			Input time in minutes : &nbsp;
			{p.children}
		</div>
	)
}
export const TimeInput = (p:{time:any, set_time:any, color:string}) => {
	const cellTimeInputStyle = {
		padding:" 0 10px",
		border:"1px solid black",
		maxWidth:"100px",
		height:"30px",
		borderRadius:"10px",
	}
	return (
		<CellTime color={p.color}>
			<input
				value     = {p.time}
				onChange  = {(e)=>{p.set_time(Number(e.target.value))}}
				type      = "number" min="0"
				className = "flex tac center"
				style     = {cellTimeInputStyle}
			/>
		</CellTime>
	)
}

