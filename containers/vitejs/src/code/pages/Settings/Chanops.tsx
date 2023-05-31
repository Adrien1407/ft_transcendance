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

export function ChanopsButton (p:{time:number, user_id: string}) {

	const chatSocket         = useContext(ChatSocket)
	const [color, set_color] = useState("")
	const [text, set_text]   = useState("")

	useEffect(()=>{
		common.getChanops(channel_id)
		.then(res=>{
			let promoted_users = res.data;
			console.log(res.data)
			let chanops = false;
			for (let i = 0; i < promoted_users.length; i++) {
				if (promoted_users[i].id === Number(p.user_id)) {
					chanops = true;
					console.log(chanops)
					break;
				}
			}
			set_color(chanops?"#ea6962":"#A3BE8C")
			set_text(chanops?"Demote":"Promote")
		})
		.catch((res)=>console.log(res))
	}, [])


	function ban_toggle() {
		if (text === "Promote") {
			console.log("promoting")
			sock.promoteToChanOP({
				socket     : chatSocket,
				channel_id : channel_id,
				user_id    : p.user_id,
				callback() {
					set_color("#ea6962")
					set_text("Demote")
				}
			})
		}

		else if (text === "Demote") {
				console.log("demote")
			sock.demoteFromChanOP({
				socket     : chatSocket,
				channel_id : channel_id,
				user_id    : p.user_id,
				callback() {
					set_color("#A3BE8C")
					set_text("Promote")
				}
			})
		}
	}
	return (<common.ButtonElement color={color} onClick={ban_toggle} value={text}/>)
}

const Chanops = (p:any) => {
	channel_id = utils.getCurrentRoomId()
	const settings_main = "/channelchat/" + channel_id + "/settings"

	const [bantime, set_bantime] = useState(1)
	const [users, set_users] = useState<any>([])

	useEffect(()=>{
		common.getChannelUsers(channel_id)
		.then(res=>{set_users(res.data)})
		.catch((res)=>console.log(res))
	}, [])


	let array = [];
	array = common.cellFactory(users, bantime, "chanops")
	if (array.length === 0)
	return (
		<Frame title={"Channel operators"} titleImgLeft={goBack} hrefLeft={settings_main} chat={true}>
		<div className="flex fill center">
			You are alone in this chat
		</div>
		</Frame>
	)

		//  <common.Empty channel_id={channel_id} title={"Channel operators"}/>

	return (
		<Frame title="Channel Operators" titleImgLeft={goBack} hrefLeft={settings_main} chat={true}>
			<common.Container>
				{array}
			</common.Container>
		</Frame>)
}

export default Chanops
