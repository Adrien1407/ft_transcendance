import Frame from "@/components/Frame"
import * as utils from "@/utils/utils"
import * as sock from "@/utils/socket"
import axios, { all } from "axios"
import { useState } from "react"
import { useEffect } from "react"
import {motion, AnimatePresence} from 'framer-motion'
import goBack from '@/assets/square_chev_left.svg'
import {ChatSocket} from '@/src/main'
import { useContext } from "react"


import * as common from './common'

let channel_id : any

export function BanButton (p:{time:number, user_id: string, isBanned? : boolean}) {

	const chatSocket         = useContext(ChatSocket)
	const [color, set_color] = useState("")
	const [text, set_text]   = useState("")
	const [muted_users, set_muted_users] = useState<any>([])

	useEffect(()=>{p.isBanned ? set_color("#A3BE8C") : set_color("#ea6962")}, [])
	useEffect(()=>{p.isBanned ? set_text("Unban") : set_text("Ban")}, [])
	useEffect(()=>{
		common.getMutedUsers(channel_id)
		.then(res=>{set_muted_users(res.data)})
		.catch((res)=>console.log(res))
	}, [])

	function ban_toggle() {
		if (text === "Ban") {
			sock.banFromChannel({
				socket     : chatSocket,
				channel_id : channel_id,
				user_id    : p.user_id,
				time       : p.time,
				callback() {
					console.log("ban")
				}
			})
			set_color("#A3BE8C")
			set_text("Unban")
		}

		else if (text === "Unban") {
			sock.unbanFromChannel({
				socket     : chatSocket,
				channel_id : channel_id,
				user_id    : p.user_id,
				callback() {
					console.log("unban")
				}
			})
			set_color("#ea6962")
			set_text("Ban")
		}
	}
	return (<common.ButtonElement color={color} onClick={ban_toggle} value={text}/>)
}


//function is_banned(channel_user:any, banned_users:any) {

//}


const Bans = (p:any) => {
	channel_id = utils.getCurrentRoomId()
	const settings_main = "/channelchat/" + channel_id + "/settings"

	const [bantime, set_bantime] = useState(1)
	const [users, set_users] = useState<any>([])
	const [banned, set_banned] = useState<any>([])

	useEffect(()=>{
		common.getChannelUsers(channel_id)
		.then(res=>{set_users(res.data)})
		.catch((res)=>console.log(res))
	}, [])

	useEffect(()=>{
		common.getBannedUsers(channel_id)
		.then(res=>{set_banned(res.data)})
		.catch((res)=>console.log(res))
	}, [])

	let array = [];
	let allUsers = {users, banned}
	array = common.cellFactory(users, bantime, "ban", false).concat(common.cellFactory(banned, bantime, "ban", true))

	if (array.length === 0)
		return <common.Empty channel_id={channel_id} title={"Banned users"}/>

	return (
		<Frame title="Ban from channel" titleImgLeft={goBack} hrefLeft={settings_main} chat={true}>
			<common.Container>
				<common.TimeInput time={bantime} set_time={set_bantime} color="#ea6962"/>
				{array}
			</common.Container>
		</Frame>)
}

export default Bans
