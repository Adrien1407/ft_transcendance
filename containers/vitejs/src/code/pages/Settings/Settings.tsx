import React, {useContext, useState, SetStateAction} from "react"
import { useNavigate } from 'react-router-dom';
import Frame from '@/components/Frame'
import goBack from '@/assets/square_chev_left.svg'
import {ChatSocket} from '@/src/main'
import {motion, AnimatePresence} from 'framer-motion'
import * as sock from "@/utils/socket"
import ChangeNameInput from "./ChangeNameInput"
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import axios from "axios";

function Input (p: {
	disabled? : boolean,
	value               : string,
	form_type           : string,
	title               : string,
	setValue            : React.Dispatch<SetStateAction<string>>,
	hide_when_not_type? : number,
	channel_type?       : number
}) {
	const is_enabled = true;
	const Title = () => { return (<div className="flex w100"style={{color:is_enabled?"black":"#aaaaaa"}}>{p.title}</div>) }
	return (
		<div className="flex w100 col center ">
			<Title/>
			<div className="flex row w100 ">
				<input
					maxLength={20}
					className = "flex w100"
					disabled  = {p.disabled}
					value     = {p.value}
					type      = {p.form_type}
					onChange  = {(e)=>p.setValue(e.target.value)}
					style     = {{
						borderRadius:"10px",
						height:"50px",
						marginBottom:"20px",
						paddingLeft:"10px",
						border:"1px solid black",
					}}/>
				<div style={{opacity:0, cursor:""}}>
					<Button p color="" name={"Submit"}/>
				</div>
			</div>
		</div>
	)
}

function Button (p:{p?:boolean, b?:boolean, noMargin?:boolean, fill?:boolean, onClickAction?:any, name?:string, color:string, leave?:string}) {
	const navigate =  useNavigate();
	return (
		<motion.div className={`flex center tac ${p.fill?"w100":""}`}
			initial={true}
			onClick={()=>{
				if (p.name === "Submit" || p.leave=== "LEAVE CHANNEL") {
				}
				navigate(p.onClickAction)
			}}
			whileTap={{x:"-3px", y:"3px", boxShadow:"-1px 1px 0px 0px"}}
			style={{
				height:"50px",
				borderRadius:"10px",
				border:"1px solid black",
				padding:"10px",
				boxSizing:"border-box",
				boxShadow:"-3px 3px 0px 0px ",
				cursor:p?"default":"pointer",
				backgroundColor:p.color,
				userSelect:"none",
				marginLeft:p.noMargin?"":"40px",
				marginBottom:p.b?"20px":""
			}}
		>
			{p.name}
			<div className="flex" style={{color:"white"}}>{p.leave}</div>
		</motion.div>
	)
}




function LeaveButton (p:{b?:boolean, noMargin?:boolean, fill?:boolean, onClickAction?:any, name?:string, color:string, leave?:string}) {
	const chatSocket = useContext(ChatSocket)
	const navigate =  useNavigate();
	const windowUrl = window.location.href;
	const channel_id = Number(windowUrl.split("/")[4])
	return (
		<motion.div className={`flex center tac ${p.fill?"w100":""}`}
			initial={true}
			onClick={()=>{
				sock.leaveChannel({
					socket: chatSocket,
					channel_leave : channel_id,
					callback() {
						console.log("leaving channel")
						navigate("/landing")
					}
				})
			}}
			whileTap={{x:"-3px", y:"3px", boxShadow:"-1px 1px 0px 0px"}}
			style={{
				height:"50px",
				borderRadius:"10px",
				border:"1px solid black",
				padding:"10px",
				boxSizing:"border-box",
				boxShadow:"-3px 3px 0px 0px ",
				cursor:"pointer",
				backgroundColor:p.color,
				userSelect:"none",
				marginLeft:p.noMargin?"":"40px",
				marginBottom:p.b?"20px":""
			}}
		>
			{p.name}
			<div className="flex" style={{color:"white"}}>{p.leave}</div>
		</motion.div>
	)
}



function Settings() {
	const navigate =  useNavigate();
	const windowUrl = window.location.href;
	const channel_id = Number(windowUrl.split("/")[4])
	const [value, setValue] = useState("")
	const [type, setType] = useState(0)
	const [disabled, setDisabled] = useState(false)
	const [typeChannel, setTypeChannel] = useState(0);

	useEffect(() => {
		axios.get(`${import.meta.env.VITE_BACK_URL}/channel/${channel_id}`, {withCredentials:true})
		.then(res => {setTypeChannel(res.data.type)})
	}, [])
	
	function ChannelTypeButton (p:{p?:boolean, b?:boolean, noMargin?:boolean, fill?:boolean, onClickAction?:any, name?:string, color:string, leave?:string}) {
		const [color, set_color] = useState("")
		const navigate =  useNavigate();
		const chatSocket = useContext(ChatSocket)
		const windowUrl = window.location.href;
		const channel_id = Number(windowUrl.split("/")[4])
		return (
			<motion.div className={`flex center tac ${p.fill?"w100":""}`}
				initial={true}
				onClick={()=>{
					sock.changeChannelVisibility({
						socket: chatSocket,
						channel_id:channel_id,
						new_visibility: type,
						password : value,
						callback() {
							console.log("channel type changed")
							set_color("#A3BE8C")
						}
					})
					set_color("#ea6962")
				}}
				whileTap={{x:"-3px", y:"3px", boxShadow:"-1px 1px 0px 0px"}}
				style={{
					height:"50px",
					borderRadius:"10px",
					border:"1px solid black",
					padding:"10px",
					boxSizing:"border-box",
					boxShadow:"-3px 3px 0px 0px ",
					cursor:p?"default":"pointer",
					backgroundColor:color,
					userSelect:"none",
					marginLeft:p.noMargin?"":"40px",
					marginBottom:p.b?"20px":""
				}}
			>
				{p.name}
				<div className="flex" style={{color:"white"}}>{p.leave}</div>
			</motion.div>
		)
	}

	function ButtonGroup  (p:any) {
		return (
			<div className="flex w100 jcsb col"style={{paddingTop:"10px"}}>
				{typeChannel !== 3 ? <>
					<div className="flex fill center">
						<Button onClickAction={`/channelchat/${channel_id}/invites`} b fill noMargin color="#A3BE8C"name={"invite  list"}/>
						<Button onClickAction={`/channelchat/${channel_id}/muted`} b fill color="#EBCB8B"name={"mute    list"}/>
					</div>
					<div className="flex fill center">
						<Button onClickAction={`/channelchat/${channel_id}/bans`} b fill noMargin color="#ea6962"name={"Ban list"}/>
						<Button onClickAction={`/channelchat/${channel_id}/chanops`} b fill color="#7C9C90"name={"Chanops list"}/>
					</div>
					<LeaveButton b noMargin color="#191d20" leave={"LEAVE CHANNEL"}/>
					</> :
					<LeaveButton b noMargin color="#191d20" leave={"LEAVE CHANNEL"}/>
				}
			</div>
		)
	}


	function Radio (p: {type: number, label: string}) {
		return (
			<div className="flex w30">
				<div className="flex"
					onClick={()=>{setType(p.type)}}
					style={{
						minWidth:"20px",
						minHeight:"20px",
						backgroundColor:p.type === type ?"black": "white",
						border:"1px solid black",
						margin:"0 10px 20px 0",
						borderRadius:"4000px"
					}}>
				</div>
				<div className="flex w100">
					{p.label}
				</div>
			</div>
		)
	}

	function RadioGroup(p:any) {
		useEffect(()=>{
			if (type === 1)
				setDisabled(false)
			else
				setDisabled(true)
		}, [disabled])

		return (
			<div className="flex w100">
				<div className="flex w100 col ">
					<div className="flex w100" style={{paddingBottom:"0px"}}>New channel type</div>
					<div className="flex w100 col"
						style={{
							boxSizing:"border-box",
							backgroundColor:"white",
							padding:"20px 0 0 10px",
							borderRadius:"10px",
							border:"1px solid black",
							marginBottom:"10px"
						}}>
						<Radio type={0} label={"Public"}/>
						<Radio type={2} label={"Private"}/>
						<Radio type={1} label={"Password"}/>
					</div>
				</div>
				<div className="flex aic">
					<ChannelTypeButton color="" name={"Submit"}/>
				</div>
			</div>

		)
	}

	const DesktopVersion = () => {
		return (
			<>
			{typeChannel !== 3 ? <>
				<ChangeNameInput  value={value} setValue={setValue} form_type={"text"} title="New Channel Name"/>
				<div className="flex col w100">
					<Input disabled={disabled} value={value} setValue={setValue} form_type={"password"} title="New password"/>
					<RadioGroup/>
				</div>
				<ButtonGroup/>
			</> :
			<>
				<ButtonGroup/>
			</>
			}
		</>
		)
	}

	const MobileVersion = () => {
		console.log(typeChannel)
		return(
			<>
			{typeChannel !== 3 ? <>
			<button className="w100" style={{backgroundColor:'#191d20', color:'white'}}onClick={() => {
				boolGroup === 'option' ? setBoolGroup('name') :
				boolGroup === '' ? setBoolGroup('name') : setBoolGroup('')
				}}>Information channel</button>
				{boolGroup === 'name' ? <>
								<ChangeNameInput  value={value} setValue={setValue} form_type={"text"} title="New Channel Name"/>
								<div className="flex col w100">
									<Input disabled={disabled} value={value} setValue={setValue} form_type={"password"} title="New password"/>
									<RadioGroup/>
								</div>
								</>
				: <></>}

			<button className="w100" style={{backgroundColor:'#191d20', color:'white', margin:'10px 0'}}onClick={() => {
				boolGroup === 'name' ? setBoolGroup('option') :
				boolGroup === '' ? setBoolGroup('option') : setBoolGroup('')
				}}>Other Option</button>
			{boolGroup === 'option' ? <ButtonGroup/> : <></>}
			</> :
			<>
				<ButtonGroup/>
			</>
			}
			</>
		)
	}

	const [boolGroup, setBoolGroup] = useState<string>('');
	const phone = useMediaQuery({maxHeight:700});
	return (
		<Frame title={"Channel settings"} titleImgLeft={goBack} hrefLeft={`/channelchat/${channel_id}`} chat={true} >
			<div className="flex fill col center ">
				<div className="flex col h50 w80 center">
					{phone ? <MobileVersion/> : <DesktopVersion/>}
				</div>
			</div>
		</Frame>
	)
}

export default Settings
