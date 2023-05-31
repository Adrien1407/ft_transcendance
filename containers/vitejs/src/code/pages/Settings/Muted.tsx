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


import * as common from './common'

let channel_id : any

export function MuteButton (p:{type:string, time:number, user_id: string }) {

	channel_id = utils.getCurrentRoomId()
	console.log(channel_id)
	const chatSocket         = useContext(ChatSocket)
	const [color, set_color] = useState("")
	const [text, set_text]   = useState("")

	useEffect(()=>{
		common.getMutedUsers(channel_id)
		.then(res=>{
			let muted_users = res.data;
			let muted = false;
			for (let i = 0; i < muted_users.length; i++) {
				if (muted_users[i].id === Number(p.user_id)) {
					muted = true;
					break;
				}
			}
			set_color(muted?"#A3BE8C":"#EBCB8B")
			set_text(muted?"Unmute":"Mute")
		})
		.catch((res)=>console.log(res))
	}, [])

	useEffect(()=>{}, [])
	console.log(p.type)

	function ban_toggle() {
		if (text === "Mute") {
			sock.muteInChannel({
				socket     : chatSocket,
				channel_id : channel_id,
				user_id    : p.user_id,
				time       : p.time,
				callback() {
					set_color("#A3BE8C")
					set_text("Unmute")
				}
			})
		}

		else if (text === "Unmute") {
			sock.unmuteInChannel({
				socket     : chatSocket,
				channel_id : channel_id,
				user_id    : p.user_id,
				callback() {
					set_color("#EBCB8B")
					set_text("Mute")
				}
			})
		}
	}
	return (<common.ButtonElement color={color} onClick={ban_toggle} value={text}/>)
}

const Muted = (p:any) => {
	channel_id = utils.getCurrentRoomId()
	const settings_main = "/channelchat/" + channel_id + "/settings"

	const [bantime, set_bantime] = useState(1)
	const [users, set_users] = useState<any>([])

	useEffect(()=>{
		common.getChannelUsers(channel_id)
		.then(res=>{set_users(res.data)})
		.catch((res)=>console.log(res))
	}, [])

	console.log(users)

	let array = [];
	array = common.cellFactory(users, bantime, "mute")
	if (array.length === 0)
		return <common.Empty channel_id={channel_id} title={"Banned users"}/>

	return (
		<Frame title="Mute from channel" titleImgLeft={goBack} hrefLeft={settings_main} chat={true}>
			<common.Container>
				<common.TimeInput time={bantime} set_time={set_bantime} color="#EBCB8B"/>
				{array}
			</common.Container>
		</Frame>)
}

export default Muted
